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
                return window.atob(resp.app.drive.file.base64Content);
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
