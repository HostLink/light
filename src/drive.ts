import { query, mutation } from '.';

import files from './file';
import folders from './folder';

/**
 * @deprecated Use `fs.listFolders` / `fs.listFiles` from `filesystem` instead.
 */
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

/**
 * @deprecated Use functions from `filesystem` (fs.*) instead.
 * - listFiles     → fs.listFiles(location)
 * - listFolders   → fs.listFolders(location)
 * - writeFile     → fs.writeFile(location, content)
 * - deleteFile    → fs.deleteFile(location)
 * - renameFile    → fs.renameFile(location, newName)
 * - moveFile      → fs.move(from, to)
 * - createFolder  → fs.createFolder(location)
 * - deleteFolder  → fs.deleteFolder(location)
 * - renameFolder  → fs.renameFolder(location, newName)
 * - uploadTempFile → fs.uploadTempFile(location, file)
 */
export const getDrive = (index: number) => {
    return createDrive(query, mutation)(index);
}

export const createDrive = (queryFn: typeof query, mutationFn: typeof mutation) => (index: number) => {
    const $files = files(index, queryFn, mutationFn);
    const $folders = folders(index, queryFn, mutationFn);

    return {
        folders: $folders,
        files: $files,
        listFiles: $files.list,
        getFile: $files.get,
        readFile: $files.read,
        writeFile: $files.write,
        deleteFile: $files.delete,
        renameFile: $files.rename,
        moveFile: $files.move,
        listFolders: $folders.list,
        createFolder: $folders.create,
        deleteFolder: $folders.delete,
        renameFolder: $folders.rename,


        uploadTempFile: (file: File) => {
            return mutationFn({
                lightDriveUploadTempFile: {
                    __args: { index, file },
                    name: true,
                    path: true,
                    size: true,
                    mime: true
                }
            }).then(res => res.lightDriveUploadTempFile) as Promise<{ name: string, path: string, size: number, mime: string }>;
        },
    }
}


export default () => {
    return {
        list: listDrives() as Promise<Array<{ index: number, name: string }>>,
        get: getDrive

    }
}
