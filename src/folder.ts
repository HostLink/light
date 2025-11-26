import { query, mutation } from '.';

export type FolderFields = {
    name?: string,
    path?: string
}

export type QueryFolderFields = Record<keyof FolderFields, boolean>

const defaultFields: QueryFolderFields = {
    name: true,
    path: true
}

export const listFolders = (index: number, path: string, fields: QueryFolderFields = defaultFields) => {
    return query({
        app: {
            drive: {
                __args: { index },
                folders: {
                    __args: { path },
                    ...fields
                }
            }
        }
    }).then(resp => resp.app.drive.folders) as Promise<Array<Record<keyof FolderFields, any>>>;
}

export default (index: number) => {
    return {
        list: (path: string, fields: QueryFolderFields = defaultFields) => {
            return listFolders(index, path, fields);
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
    };
}
