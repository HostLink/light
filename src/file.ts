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

/**
 * @deprecated Use `fs.listFiles` / `fs.readFile` from `filesystem` instead.
 */
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

/**
 * @deprecated Use `fs.readFile(location, 'base64')` from `filesystem` instead.
 */
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

/**
 * @deprecated Use `fs.listFiles` from `filesystem` instead.
 * The default export factory function is also deprecated — use `fs.*` directly.
 */
export default (index: number, queryFn: typeof query = query, mutationFn: typeof mutation = mutation) => {
    return {
        list: (path: string, fields: QueryFileFields = defaultFields) => {
            return queryFn({ app: { drive: { __args: { index }, files: { __args: { path }, ...fields } } } })
                .then(resp => resp.app.drive.files);
        }, get: (path: string, fields: QueryFileFields = {
            name: true,
            path: true,
            size: true,
            mime: true,
            url: true
        }) => {
            return queryFn({
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
            return queryFn({ app: { drive: { __args: { index }, file: { __args: { path }, base64Content: true } } } })
                .then(resp => resp.app.drive?.file?.base64Content);
        },
        read: async (path: string) => {

            let resp = await queryFn({
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
            return mutationFn({ lightDriveWriteFile: { __args: { index, path, content } } }).then(res => res.lightDriveWriteFile);
        },
        delete: (path: string) => {
            return mutationFn({ lightDriveDeleteFile: { __args: { index, path } } }).then(res => res.lightDriveDeleteFile);
        },
        rename: (path: string, name: string) => {
            return mutationFn({ lightDriveRenameFile: { __args: { index, path, name } } }).then(res => res.lightDriveRenameFile);
        },
        move: (source: string, destination: string) => {
            return mutationFn({ lightDriveMoveFile: { __args: { index, source, destination } } }).then(res => res.lightDriveMoveFile);
        }
    };

}
