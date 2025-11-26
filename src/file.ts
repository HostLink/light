import { query, mutation } from '.';

export type FileFields = {
    name?: string,
    path?: string
    size?: number,
    mime?: string,
    url?: string
}

export type QueryFileFields = Partial<Record<keyof FileFields, boolean>>

const defaultFields: QueryFileFields = {
    name: true,
    path: true,
    size: true,
    mime: true,
    url: true
}

export const listFiles = (index: number, path: string, fields: QueryFileFields = defaultFields) => {
    return query({
        app: {
            drive: {
                __args: { index },
                files: {
                    __args: { path },
                    ...fields
                }
            }
        }
    }).then(resp => resp.app.drive.files);
}

export const readFileAsBase64 = (index: number, path: string): Promise<string> => {
    return query({
        app: {
            drive: {
                __args: {
                    index
                },
                file: {
                    __args: {
                        path
                    },
                    base64Content: true,
                }
            }
        }
    }).then(resp => resp.app.drive?.file?.base64Content);

}

export default (index: number) => {
    return {
        list: (path: string, fields: QueryFileFields = defaultFields) => {
            return listFiles(index, path, fields);
        }, get: (path: string, fields: QueryFileFields = {
            name: true,
            path: true,
            size: true,
            mime: true,
            url: true
        }) => {
            return query({
                app: {
                    drive: {
                        __args: {
                            index
                        },
                        file: {
                            __args: {
                                path
                            },
                            ...fields
                        }
                    }
                }
            }).then(resp => resp.app.drive.file);

        },
        readFileAsBase64(path: string): Promise<string> {
            return readFileAsBase64(index, path);
        },
        read: async (path: string) => {

            let resp = await query({
                app: {
                    drive: {
                        __args: {
                            index
                        },
                        file: {
                            __args: {
                                path
                            },
                            base64Content: true,
                        }
                    }
                }
            });

            // 檢查回應是否有效
            if (!resp.app.drive.file || !resp.app.drive.file.base64Content) {
                throw new Error(`File not found or cannot read content: ${path}`);
            }

            // 檢查是否在瀏覽器環境中
            if (typeof window !== 'undefined' && window.atob) {
                return window.atob(resp.app.drive.file.base64Content);
            } else {
                // 在 Node.js 環境中，先簡單返回 base64 內容
                // 實際使用時可能需要根據環境進行適當的解碼
                return resp.app.drive.file.base64Content;
            }
        },
        write: (path: string, content: string) => {
            return mutation({ lightDriveWriteFile: { __args: { index, path, content } } }).then(res => res.lightDriveWriteFile);
        },
        delete: (path: string) => {
            return mutation({ lightDriveDeleteFile: { __args: { index, path } } }).then(res => res.lightDriveDeleteFile);
        },
        rename: (path: string, name: string) => {
            return mutation({ lightDriveRenameFile: { __args: { index, path, name } } }).then(res => res.lightDriveRenameFile);
        },
        move: (source: string, destination: string) => {
            return mutation({ lightDriveMoveFile: { __args: { index, source, destination } } }).then(res => res.lightDriveMoveFile);
        }
    };

}
