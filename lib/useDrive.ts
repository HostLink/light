import type { AxiosInstance } from 'axios';
import { mutation, query } from '.';

import useFile from './useFile';

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

export const useDrive = (index: number, axios: AxiosInstance) => {
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
            }).then(res => res.lightDriveUploadTempFile) as Promise<{ name: string, path: string, size: number, mime: string }>;
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
                }).then(resp => resp.app.drive.folders) as Promise<Array<typeof fields>>
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
        files: useFile(axios, index)
    }
}


export default useDrive
