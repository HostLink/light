import { query, mutation } from '.';

import files from './file';
import folders from './folder';

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
    const $files = files(index);
    const $folders = folders(index);

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
    }
}


export default () => {
    return {
        list: listDrives() as Promise<Array<{ index: number, name: string }>>,
        get: getDrive

    }
}