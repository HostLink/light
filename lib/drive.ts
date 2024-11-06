import { AxiosInstance } from 'axios';
import { mutation, query } from '.';


export default (index: number, axios: AxiosInstance) => {
    return {
        folders: {
            list: async (path: string, fields: Object = {
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
            list: async (path: string, fields: Object = {
                path: true,
                size: true,
                mime: true,
                canPreview: true,
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
            read: async (path: string) => {
                let resp = await query(axios, {
                    app: {
                        drive: {
                            __args: {
                                index
                            }
                        },
                        fsFile: {
                            __args: {
                                path
                            },
                            base64Content: true,
                        },
                    }
                });

                return window.atob(resp.app.fsFile.base64Content);
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
