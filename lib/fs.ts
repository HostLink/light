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
                let resp = await query(axios, {
                    fsListFiles: {
                        __args: {
                            path: path
                        },
                        name: true,
                        path: true,
                        size: true,
                        mime: true,
                        canPreview: true,
                        imagePath: true,
                    },

                });

                return resp.fsListFiles;
            },
            read: async (path: string) => {
                let resp = await query(axios, {
                    fsFile: {
                        __args: {
                            path: path
                        },
                        base64Content: true,
                    },
                });

                return window.atob(resp.fsFile.base64Content);
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
