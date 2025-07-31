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
            return mutation(axios, "lightDriveUploadTempFile", {
                index,
                file
            }, {
                name: true,
                path: true,
                size: true,
                mime: true,
            })
        },
        folders: {
            list: async (path: string, fields: FolderFields = {
                name: true,
                path: true
            }) => {
                let resp = await query(axios, {
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
                });

                return resp.app.drive.folders;
            },
            create: (path: string) => {
                return mutation(axios, "lightDriveCreateFolder", { index, path });
            },
            delete: (path: string) => {
                return mutation(axios, "lightDriveDeleteFolder", { index, path });
            },
            rename: (path: string, name: string) => {
                return mutation(axios, "lightDriveRenameFolder", { index, path, name });
            }
        },
        files: {
            list: async (path: string, fields: FileFields = {
                name: true,
                path: true,
                size: true,
                mime: true,
                url: true
            }) => {
                let resp = await query(axios, {
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
                });

                return resp.app.drive.files;
            },
            get: async (path: string, fields: FileFields = {
                name: true,
                path: true,
                size: true,
                mime: true,
                url: true
            }) => {
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
                                ...fields
                            }
                        }
                    }
                });

                return resp.app.drive.file;
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
                return mutation(axios, "lightDriveWriteFile", { index, path, content });
            },
            delete: (path: string) => {
                return mutation(axios, "lightDriveDeleteFile", { index, path });
            },
            rename: (path: string, name: string) => {
                return mutation(axios, "lightDriveRenameFile", { index, path, name });
            },
            move: (source: string, destination: string) => {
                return mutation(axios, "lightDriveMoveFile", { index, source, destination });
            }
        }
    }
}
