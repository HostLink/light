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
    return {
        listFiles: files(index).list,
        getFile: files(index).get,
        readFile: files(index).read,
        writeFile: files(index).write,
        deleteFile: files(index).delete,
        renameFile: files(index).rename,
        moveFile: files(index).move,

        listFolders: folders(index).list,
        createFolder: folders(index).create,
        deleteFolder: folders(index).delete,
        renameFolder: folders(index).rename,


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
        folders: folders(index),
        files: files(index)
    }
}


export default () => {
    return {
        list: listDrives() as Promise<Array<{ index: number, name: string }>>,
        get: getDrive

    }
}