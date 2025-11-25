import { query, mutation } from '.';

import listFiles from './file';

export type FolderFields = {
    name?: boolean,
    path?: boolean
}


export const listDrives = () => {
    return query({
        app: {
            drives: {
                index: true,
                name: true,
            }
        }
    }).then(resp => resp.app.drives);
}





export const getDrive = (index: number) => {
    return {
        uploadTempFile: (file: File) => {
            return mutation({
                lightDriveUploadTempFile: {
                    __args: { index, file },
                    name: true,
                    path: true,
                    size: true,
                    mime: true
                }
            }).then(res => res.lightDriveUploadTempFile) as Promise<{ name: string, path: string, size: number, mime: string }>;
        },
        folders: {
            list: (path: string, fields: FolderFields = {
                name: true,
                path: true
            }) => {
                return query({
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
                }).then(resp => resp.app.drive.folders) as Promise<Array<typeof fields>>
            },
            create: (path: string) => {
                return mutation({ lightDriveCreateFolder: { __args: { index, path } } }).then(res => res.lightDriveCreateFolder);
            },
            delete: (path: string) => {
                return mutation({ lightDriveDeleteFolder: { __args: { index, path } } }).then(res => res.lightDriveDeleteFolder);
            },
            rename: (path: string, name: string) => {
                return mutation({ lightDriveRenameFolder: { __args: { index, path, name } } }).then(res => res.lightDriveRenameFolder);
            }
        },
        files: listFiles(index)
    }
}


export default () => {
    return {
        list: listDrives() as Promise<Array<{ index: number, name: string }>>,
        get: getDrive

    }
}