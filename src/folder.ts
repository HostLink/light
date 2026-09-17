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

/**
 * @deprecated Use `fs.listFolders` from `filesystem` instead.
 */
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

/**
 * @deprecated Use `fs.createFolder` / `fs.deleteFolder` / `fs.renameFolder` from `filesystem` instead.
 */
export default (index: number, queryFn: typeof query = query, mutationFn: typeof mutation = mutation) => {
    return {
        list: (path: string, fields: QueryFolderFields = defaultFields) => {
            return queryFn({ app: { drive: { __args: { index }, folders: { __args: { path }, ...fields } } } })
                .then(resp => resp.app.drive.folders);
        },
        create: (path: string) => {
            return mutationFn({ lightDriveCreateFolder: { __args: { index, path } } }).then(res => res.lightDriveCreateFolder);
        },
        delete: (path: string) => {
            return mutationFn({ lightDriveDeleteFolder: { __args: { index, path } } }).then(res => res.lightDriveDeleteFolder);
        },
        rename: (path: string, name: string) => {
            return mutationFn({ lightDriveRenameFolder: { __args: { index, path, name } } }).then(res => res.lightDriveRenameFolder);
        }
    };
}
