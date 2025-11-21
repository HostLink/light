import { describe, it, expect, beforeEach } from 'vitest';
import { VariableType } from 'json-to-graphql-query';

// 提取 processArgs 函數用於測試
function processArgs(obj: any, allVariables: any, map: any, fd: FormData, fileIndexRef: { current: number }) {
    if (!obj || typeof obj !== 'object') {
        return;
    }

    for (let key in obj) {
        const field = obj[key];
        if (field && typeof field === 'object') {
            // Process __args if exists
            if ('__args' in field) {
                const args = field.__args;
                const __args: any = {};

                Object.entries(args).forEach(([argKey, value]) => {
                    // Check if value is array of File
                    if (value instanceof Array && arrayHasFile(value)) {
                        __args[argKey] = new VariableType(argKey);
                        let j = 0;
                        value.forEach((v) => {
                            if (v instanceof File) {
                                if (!map[fileIndexRef.current]) {
                                    map[fileIndexRef.current] = [];
                                }
                                map[fileIndexRef.current].push("variables." + argKey + "." + j);
                                fd.append(fileIndexRef.current.toString(), v);
                                fileIndexRef.current++;
                                j++;
                            }
                        })
                        allVariables[argKey] = "[Upload!]!";

                    } else if (value instanceof File) {
                        __args[argKey] = new VariableType(argKey);
                        map[fileIndexRef.current] = ["variables." + argKey];
                        fd.append(fileIndexRef.current.toString(), value);
                        allVariables[argKey] = "Upload!";
                        fileIndexRef.current++;
                    } else if (value instanceof Object && objectHasFile(value)) {
                        __args[argKey] = {};
                        Object.entries(value).forEach(([k, v]) => {
                            if (v instanceof Array && arrayHasFile(v)) {
                                __args[argKey][k] = new VariableType(k);
                                let j = 0;
                                v.forEach((item) => {
                                    if (item instanceof File) {
                                        if (!map[fileIndexRef.current]) {
                                            map[fileIndexRef.current] = [];
                                        }
                                        map[fileIndexRef.current].push("variables." + k + "." + j);
                                        fd.append(fileIndexRef.current.toString(), item);
                                        fileIndexRef.current++;
                                        j++;
                                    }
                                })
                                allVariables[k] = "[Upload!]!";
                            } else if (v instanceof File) {
                                __args[argKey][k] = new VariableType(k);
                                map[fileIndexRef.current] = ["variables." + k];
                                fd.append(fileIndexRef.current.toString(), v);
                                allVariables[k] = "Upload!";
                                fileIndexRef.current++;
                            } else {
                                __args[argKey][k] = v;
                            }
                        })

                    } else {
                        if (value !== undefined && value !== null) {
                            __args[argKey] = value;
                        }
                    }
                });

                field.__args = __args;
            }

            // Recursively process nested fields
            processArgs(field, allVariables, map, fd, fileIndexRef);
        }
    }
}

// Helper functions from fileUtils.ts
function arrayHasFile(arr: any[]): boolean {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] instanceof File) {
            return true;
        }
    }
    return false;
}

function objectHasFile(obj: any): boolean {
    for (let key in obj) {
        if (obj[key] instanceof File) {
            return true;
        }
        if (obj[key] instanceof Array && arrayHasFile(obj[key])) {
            return true;
        }
    }
    return false;
}

describe('processArgs', () => {
    let fd: FormData;
    let allVariables: any;
    let map: { [key: number]: string[] };
    let fileIndexRef: { current: number };

    beforeEach(() => {
        fd = new FormData();
        allVariables = {};
        map = {};
        fileIndexRef = { current: 0 };
    });

    it('應該處理 null 或 undefined 物件', () => {
        processArgs(null, allVariables, map, fd, fileIndexRef);
        processArgs(undefined, allVariables, map, fd, fileIndexRef);

        expect(Object.keys(allVariables)).toHaveLength(0);
        expect(Object.keys(map)).toHaveLength(0);
    });

    it('應該處理非物件類型', () => {
        processArgs('string', allVariables, map, fd, fileIndexRef);
        processArgs(123, allVariables, map, fd, fileIndexRef);

        expect(Object.keys(allVariables)).toHaveLength(0);
        expect(Object.keys(map)).toHaveLength(0);
    });

    it('應該處理空物件', () => {
        const obj = {};

        processArgs(obj, allVariables, map, fd, fileIndexRef);

        expect(Object.keys(allVariables)).toHaveLength(0);
        expect(Object.keys(map)).toHaveLength(0);
    });

    it('應該處理單個 File 物件', () => {
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });
        const obj = {
            field1: {
                __args: {
                    fileArg: file
                }
            }
        };

        processArgs(obj, allVariables, map, fd, fileIndexRef);

        expect(allVariables.fileArg).toBe('Upload!');
        expect(map[0]).toEqual(['variables.fileArg']);
        expect(fileIndexRef.current).toBe(1);
    });

    it('應該處理檔案陣列', () => {
        const file1 = new File(['content1'], 'test1.txt', { type: 'text/plain' });
        const file2 = new File(['content2'], 'test2.txt', { type: 'text/plain' });
        const obj = {
            field1: {
                __args: {
                    filesArg: [file1, file2]
                }
            }
        };

        processArgs(obj, allVariables, map, fd, fileIndexRef);

        expect(allVariables.filesArg).toBe('[Upload!]!');
        expect(map[0]).toEqual(['variables.filesArg.0']);
        expect(map[1]).toEqual(['variables.filesArg.1']);
        expect(fileIndexRef.current).toBe(2);
    });

    it('應該處理包含檔案的物件', () => {
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });
        const obj = {
            field1: {
                __args: {
                    nestedArg: {
                        file: file,
                        name: 'document'
                    }
                }
            }
        };

        processArgs(obj, allVariables, map, fd, fileIndexRef);

        expect(allVariables.file).toBe('Upload!');
        expect(map[0]).toEqual(['variables.file']);
        expect(obj.field1.__args.nestedArg.file).toBeInstanceOf(VariableType);
        expect(obj.field1.__args.nestedArg.name).toBe('document');
        expect(fileIndexRef.current).toBe(1);
    });

    it('應該處理混合型別的引數', () => {
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });
        const obj = {
            field1: {
                __args: {
                    fileArg: file,
                    stringArg: 'hello',
                    numberArg: 42,
                    nullArg: null
                }
            }
        };

        processArgs(obj, allVariables, map, fd, fileIndexRef);

        expect(allVariables.fileArg).toBe('Upload!');
        expect(obj.field1.__args.stringArg).toBe('hello');
        expect(obj.field1.__args.numberArg).toBe(42);
        expect(obj.field1.__args.nullArg).toBeUndefined();
        expect(fileIndexRef.current).toBe(1);
    });

    it('應該遞迴處理巢狀欄位', () => {
        const file1 = new File(['content1'], 'test1.txt', { type: 'text/plain' });
        const file2 = new File(['content2'], 'test2.txt', { type: 'text/plain' });
        const obj = {
            field1: {
                __args: {
                    file: file1
                },
                nestedField: {
                    __args: {
                        file: file2
                    }
                }
            }
        };

        processArgs(obj, allVariables, map, fd, fileIndexRef);

        expect(Object.keys(allVariables)).toHaveLength(1);
        expect(map[0]).toEqual(['variables.file']);
        expect(map[1]).toEqual(['variables.file']);
        expect(fileIndexRef.current).toBe(2);
    });

    it('應該處理混合的檔案和非檔案元素的陣列', () => {
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });
        const obj = {
            field1: {
                __args: {
                    mixedArray: [file, 'text', 123]
                }
            }
        };

        processArgs(obj, allVariables, map, fd, fileIndexRef);

        expect(allVariables.mixedArray).toBe('[Upload!]!');
        expect(map[0]).toEqual(['variables.mixedArray.0']);
        expect(fileIndexRef.current).toBe(1);
    });

    it('應該處理空陣列', () => {
        const obj = {
            field1: {
                __args: {
                    emptyArray: []
                }
            }
        };

        processArgs(obj, allVariables, map, fd, fileIndexRef);

        expect(obj.field1.__args.emptyArray).toEqual([]);
        expect(Object.keys(allVariables)).toHaveLength(0);
    });

    it('應該正確標記多個檔案索引', () => {
        const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' });
        const file2 = new File(['content2'], 'file2.txt', { type: 'text/plain' });
        const file3 = new File(['content3'], 'file3.txt', { type: 'text/plain' });
        const obj = {
            field1: {
                __args: {
                    arg1: file1,
                    arg2: file2
                },
                field2: {
                    __args: {
                        arg3: file3
                    }
                }
            }
        };

        processArgs(obj, allVariables, map, fd, fileIndexRef);

        expect(map[0]).toEqual(['variables.arg1']);
        expect(map[1]).toEqual(['variables.arg2']);
        expect(map[2]).toEqual(['variables.arg3']);
        expect(fileIndexRef.current).toBe(3);
    });

    it('應該處理沒有 __args 的物件', () => {
        const obj = {
            field1: {
                regularField: 'value'
            }
        };

        processArgs(obj, allVariables, map, fd, fileIndexRef);

        expect(Object.keys(allVariables)).toHaveLength(0);
        expect(Object.keys(map)).toHaveLength(0);
    });

    it('應該保留已定義的 undefined 值', () => {
        const obj = {
            field1: {
                __args: {
                    undefinedArg: undefined,
                    definedArg: 'value'
                }
            }
        };

        processArgs(obj, allVariables, map, fd, fileIndexRef);

        expect(obj.field1.__args.undefinedArg).toBeUndefined();
        expect(obj.field1.__args.definedArg).toBe('value');
    });

    it('應該處理深層巢狀結構', () => {
        const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' });
        const file2 = new File(['content2'], 'file2.txt', { type: 'text/plain' });
        const obj = {
            level1: {
                __args: {
                    file: file1
                },
                level2: {
                    level3: {
                        __args: {
                            file: file2
                        }
                    }
                }
            }
        };

        processArgs(obj, allVariables, map, fd, fileIndexRef);

        expect(fileIndexRef.current).toBe(2);
        expect(map[0]).toEqual(['variables.file']);
        expect(map[1]).toEqual(['variables.file']);
    });

    it('應該處理包含檔案陣列的巢狀物件', () => {
        const file1 = new File(['content'], 'test.txt', { type: 'text/plain' });
        const file2 = new File(['content2'], 'test2.txt', { type: 'text/plain' });
        const obj = {
            test: {
                __args: {
                    input: {
                        files: [file1, file2]
                    }
                }
            }
        };

        processArgs(obj, allVariables, map, fd, fileIndexRef);

        expect(allVariables.files).toBe('[Upload!]!');
        expect(map[0]).toEqual(['variables.files.0']);
        expect(map[1]).toEqual(['variables.files.1']);
        expect(obj.test.__args.input.files).toBeInstanceOf(VariableType);
        expect(fileIndexRef.current).toBe(2);
    });

    it('應該處理包含多個檔案欄位的巢狀物件', () => {
        const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' });
        const file2 = new File(['content2'], 'file2.txt', { type: 'text/plain' });
        const file3 = new File(['content3'], 'file3.txt', { type: 'text/plain' });
        const obj = {
            mutation: {
                __args: {
                    data: {
                        avatar: file1,
                        attachments: [file2, file3],
                        name: 'test'
                    }
                }
            }
        };

        processArgs(obj, allVariables, map, fd, fileIndexRef);

        expect(allVariables.avatar).toBe('Upload!');
        expect(allVariables.attachments).toBe('[Upload!]!');
        expect(map[0]).toEqual(['variables.avatar']);
        expect(map[1]).toEqual(['variables.attachments.0']);
        expect(map[2]).toEqual(['variables.attachments.1']);
        expect(obj.mutation.__args.data.avatar).toBeInstanceOf(VariableType);
        expect(obj.mutation.__args.data.attachments).toBeInstanceOf(VariableType);
        expect(obj.mutation.__args.data.name).toBe('test');
        expect(fileIndexRef.current).toBe(3);
    });
});
