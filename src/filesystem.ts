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

export const renameFile = (location: string, newName: string) => {
    return mutation({
        lightFSRenameFile: {
            __args: { location, newName },
        }
    }).then(resp => resp.lightFSRenameFile);
}

export const writeFile = (location: string, content: string) => {
    return mutation({
        lightFSWriteFile: {
            __args: { location, content },
        }
    }).then(resp => resp.lightFSWriteFile);
}

export const uploadFile = (location: string, file: File) => {
    return mutation({
        lightFSUploadFile: {
            __args: { location, file },
        }
    }).then(resp => resp.lightFSUploadFile);
}

export const deleteFile = (location: string) => {
    return mutation({
        lightFSDeleteFile: {
            __args: { location },
        }
    }).then(resp => resp.lightFSDeleteFile);
}

export const move = (from: string, to: string) => {
    return mutation({
        lightFSMove: {
            __args: { from, to },
        }
    }).then(resp => resp.lightFSMove);
}

export const exists = (location: string) => {
    return query({
        app: {
            fs: {
                exists: {
                    __args: { location }
                }
            }
        }
    }).then(resp => resp.app.fs.exists);
}


export const find = (search?: string, label?: "document" | "image" | "audio" | "video" | "archive") => {
    const args: any = {};
    if (search) args.search = search;
    if (label) args.label = label;
    return query({
        app: {
            fs: {
                find: {
                    __args: args,
                    __typeName: true,
                    name: true,
                    lastModified: true,
                    location: true,
                    path: true,
                    __on: [{
                        __typeName: "File",
                        size: true,
                        mimeType: true,
                    }, {
                        __typeName: "Folder",
                    }]
                }

            }
        }
    }).then(resp => resp.app.fs.find);

};

export const list = (location: string) => {
    const q = {
        app: {
            fs: {
                node: {
                    __args: { location },
                    __typename: true,
                    __on: [{
                        __typeName: "Folder",
                        name: true,
                        location: true,
                        path: true,
                        children: {
                            __typename: true,
                            name: true,
                            lastModified: true,
                            location: true,
                            path: true,
                            __on: [{
                                __typeName: "File",
                                size: true,
                                mimeType: true,
                            }, {
                                __typeName: "Folder",
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
                node: {
                    __args: { location },
                    __on: [
                        {
                            __typeName: "File",
                            content: true
                        }
                    ]
                }
            }
        }
    }).then(resp => resp.app.fs.node.content);
}
