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
            return mutation({ fsUploadTempFile: { __args: { file }, name: true, path: true, size: true, mime: true } })
                .then(resp => resp.fsUploadTempFile);
        },
        folders: {
            list: async (path: string) => {
                let resp = await query({
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

                return mutation({ fsCreateFolder: { __args: { path } } }).then(res => res.fsCreateFolder);
            },
            delete: (path: string) => {
                return mutation({ fsDeleteFolder: { __args: { path } } }).then(res => res.fsDeleteFolder);
            },
            rename: (path: string, name: string) => {
                return mutation({ fsRenameFolder: { __args: { path, name } } }).then(res => res.fsRenameFolder);
            }
        },
        files: {
            list: async (path: string) => {
                let { app } = await query({
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
                let { app } = await query({
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
                return mutation({ fsWriteFile: { __args: { path, content } } }).then(res => res.fsWriteFile);
            },
            delete: (path: string) => {
                return mutation({ fsDeleteFile: { __args: { path } } }).then(res => res.fsDeleteFile);
            },
            rename: (path: string, name: string) => {
                return mutation({ fsRenameFile: { __args: { path, name } } }).then(res => res.fsRenameFile);
            },
            move: (source: string, target: string) => {
                return mutation({ fsMoveFile: { __args: { source, target } } }).then(res => res.fsMoveFile);
            }
        }
    }
}
