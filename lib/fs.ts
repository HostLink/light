import { mutation } from '.';
import query from './query';
export type File = {
    name: string,
    path: string,
    size: number,
    mime: string,
    canPreview: boolean,
    imagePath: string,
}


export type Folder = {
    name: String
    path: String
}

export const fsListFiles = async (path: string): Promise<Array<File>> => {

    let resp = await query({
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
}


export const fsListFolders = async (path: string): Promise<Array<Folder>> => {

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
}

export const fsReadFile = async (path: string): Promise<string> => {

    let resp = await query({
        fsFile: {
            __args: {
                path: path
            },
            base64Content: true,
        },
    });

    return window.atob(resp.fsFile.base64Content);

}

export const fsWriteFile = (path: string, content: string): Promise<boolean> => {
    return mutation("fsWriteFile", {
        path: path,
        content: content,
    });
}

export const fsDeleteFile = (path: string): Promise<boolean> => {
    return mutation("fsDeleteFile", {
        path: path,
    });
}

export const fsCreateFolder = (path: string): Promise<boolean> => {
    return mutation("fsCreateFolder", {
        path: path,
    });
}

export const fsDeleteFolder = (path: string): Promise<boolean> => {
    return mutation("fsDeleteFolder", {
        path: path,
    });
}


export const fsRenameFile = (path: string, name: string): Promise<boolean> => {
    return mutation("fsRenameFile", {
        path: path,
        name: name
    });
}

export const fsRenameFolder = (path: string, name: string): Promise<boolean> => {
    return mutation("fsRenameFolder", {
        path: path,
        name: name
    });
}


export const fsMoveFile = (source: string, target: string): Promise<boolean> => {
    return mutation("fsMoveFile", {
        source: source,
        target: target
    });
}