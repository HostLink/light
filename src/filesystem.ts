import { mutation, query } from "./";

export const createFolder = (location: string) => {
    return mutation({
        lightFSCreateFolder: {
            __args: { location },
        }
    }).then(resp => resp.lightFSCreateFolder);
}

export const deleteFolder = (location: string) => {
    return mutation({
        lightFSDeleteFolder: {
            __args: { location },
        }
    }).then(resp => resp.lightFSDeleteFolder);
}

export const renameFolder = (location: string, newName: string) => {
    return mutation({
        lightFSRenameFolder: {
            __args: { location, newName },
        }
    }).then(resp => resp.lightFSRenameFolder);
}

export const list = (path: string) => {
    const q = {
        app: {
            fs: {
                node: {
                    __args: { path },
                    __typename: true,
                    __on: [{
                        __typeName: "Folder",
                        name: true,
                        children: {
                            __typename: true,
                            name: true,
                            lastModified: true,
                            __on: [{
                                __typeName: "File",
                                size: true,
                                mimeType: true,
                                path: true
                            }]
                        }
                    }],

                }
            }
        }
    };


    return query(q).then(resp => resp.app.fs.node);
}

export const read = (location: string) => {

    return query({
        app: {
            fs: {
                file: {
                    __args: { location },
                    content: true
                }
            }
        }
    }).then(resp => resp.app.fs.file.content);
}
