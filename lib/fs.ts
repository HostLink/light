import { AxiosInstance } from 'axios';
import { mutation, query } from '.';

export type FSFile = {
    name: string,
    path: string,
    size: number,
    mime: string,
    canPreview: boolean,
    imagePath: string,
}


export type FSFolder = {
    name: String
    path: String
}

export default (axios: AxiosInstance) => {
    return {
        uploadTempFile: (file: File) => {
            return mutation(axios, "fsUploadTempFile", {
                file
            }, {
                name: true,
                path: true,
                size: true,
                mime: true,
            })
        },
        folders: {
            list: async (path: string) => {
                let resp = await query(axios, {
                    fsListFolders: {
                        __args: {
                            path: path
                        },
                        name: true,
                        path: true,
                    },

                });

                return resp.fsListFolders;
            },
            create: (path: string) => {
                return mutation(axios, "fsCreateFolder", { path });
            },
            delete: (path: string) => {
                return mutation(axios, "fsDeleteFolder", { path });
            },
            rename: (path: string, name: string) => {
                return mutation(axios, "fsRenameFolder", { path, name });
            }
        },
        files: {
            list: async (path: string) => {
                let { app } = await query(axios, {
                    app: {
                        drive: {
                            files: {
                                __args: {
                                    path
                                },
                                name: true,
                                path: true,
                                size: true,
                                mime: true,
                                canPreview: true,
                                imagePath: true,

                            }
                        }
                    }

                });

                return app.drive.files as FSFile[];
            },
            read: async (path: string) => {
                let { app } = await query(axios, {
                    app: {
                        drive: {
                            files: {
                                __args: {
                                    path
                                },
                                base64Content: true,

                            }
                        }
                    }

                });

                return window.atob(app.drive.files[0].base64Content);
            },
            write: (path: string, content: string) => {
                return mutation(axios, "fsWriteFile", {
                    path: path,
                    content: content,
                });
            },
            delete: (path: string) => {
                return mutation(axios, "fsDeleteFile", { path });
            },
            rename: (path: string, name: string) => {
                return mutation(axios, "fsRenameFile", { path, name });
            },
            move: (source: string, target: string) => {
                return mutation(axios, "fsMoveFile", { source, target });
            }
        }
    }
}
