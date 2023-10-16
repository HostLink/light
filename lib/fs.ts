import { mutation } from '.';
import query from './query';
type File = {
    name: string,
    path: string,
    size: number,
    mime: string,
    canPreview: boolean,
    imagePath: string,
}

type Folder = {
    name: String
    path: String
}

const fsListFiles = async (path: string): Promise<Array<File>> => {

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


const fsListFolders = async (path: string): Promise<Array<Folder>> => {

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

const fsReadFile = async (path: string): Promise<string> => {

    let resp = await query({
        fsFile: {
            __args: {
                path: path
            },
            content: true,
        },

    });

    //base64 decode
    return Buffer.from(resp.fsFile.content, 'base64').toString('utf-8');
}

const fsWriteFile = async (path: string, content: string): Promise<boolean> => {


    //base64 encode
    content = Buffer.from(content).toString('base64');

    return await mutation("fsWriteFileBase64", {
        path: path,
        content: content
    });
}

const fsDeleteFile = async (path: string): Promise<boolean> => {

    return await mutation("fsDeleteFile", {
        path: path,
    });
}

export {
    fsListFiles,
    fsListFolders,
    fsReadFile,
    fsWriteFile,
    fsDeleteFile,
}