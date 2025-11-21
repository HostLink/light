import type { AxiosInstance } from 'axios';
import { mutation, query } from '.';

export type FolderFields = {
    name?: boolean,
    path?: boolean
}

export type FileFields = {
    name?: boolean,
    path?: boolean,
    size?: boolean,
    mime?: boolean,
    url?: boolean
}

export default (index: number, axios: AxiosInstance) => {
    return {
        uploadTempFile: (file: File) => {
            return mutation(axios, {
                lightDriveUploadTempFile: {
                    __args: { index, file },
                    name: true,
                    path: true,
                    size: true,
                    mime: true
                }
            }).then(res => res.lightDriveUploadTempFile)
        },
        folders: {
            list: (path: string, fields: FolderFields = {
                name: true,
                path: true
            }) => {
                return query(axios, {
                    app: {
                        drive: {
                            __args: {
                                index
                            },
                            folders: {
                                __args: {
                                    path
                                },
                                ...fields
                            }
                        },
                    }
                }).then(resp => resp.app.drive.folders);
            },
            create: (path: string) => {
                return mutation(axios, { lightDriveCreateFolder: { __args: { index, path } } }).then(res => res.lightDriveCreateFolder);
            },
            delete: (path: string) => {
                return mutation(axios, { lightDriveDeleteFolder: { __args: { index, path } } }).then(res => res.lightDriveDeleteFolder);
            },
            rename: (path: string, name: string) => {
                return mutation(axios, { lightDriveRenameFolder: { __args: { index, path, name } } }).then(res => res.lightDriveRenameFolder);
            }
        },
        files: {
            list: (path: string, fields: FileFields = {
                name: true,
                path: true,
                size: true,
                mime: true,
                url: true
            }) => {
                return query(axios, {
                    app: {
                        drive: {
                            __args: {
                                index
                            },
                            files: {
                                __args: {
                                    path
                                },
                                ...fields
                            }
                        }
                    }
                }).then(resp => resp.app.drive.files);
            },
            get: (path: string, fields: FileFields = {
                name: true,
                path: true,
                size: true,
                mime: true,
                url: true
            }) => {
                return query(axios, {
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
            read: async (path: string) => {
                let resp = await query(axios, {
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
                return mutation(axios, { lightDriveWriteFile: { __args: { index, path, content } } }).then(res => res.lightDriveWriteFile);
            },
            delete: (path: string) => {
                return mutation(axios, { lightDriveDeleteFile: { __args: { index, path } } }).then(res => res.lightDriveDeleteFile);
            },
            rename: (path: string, name: string) => {
                return mutation(axios, { lightDriveRenameFile: { __args: { index, path, name } } }).then(res => res.lightDriveRenameFile);
            },
            move: (source: string, destination: string) => {
                return mutation(axios, { lightDriveMoveFile: { __args: { index, source, destination } } }).then(res => res.lightDriveMoveFile);
            }
        }
    }
}
