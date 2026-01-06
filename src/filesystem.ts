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
                    __typename: true,
                    name: true,
                    lastModified: true,
                    location: true,
                    path: true,
                    __on: [{
                        __typeName: "File",
                        size: true,
                        mimeType: true,
                        publicUrl: true,
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
                                publicUrl: true,
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

export const readFile = (location: string, type: 'text' | 'base64' = 'text') => {
    return query({
        app: {
            fs: {
                node: {
                    __args: { location },
                    __typename: true, // 獲取類型以便後續判斷
                    __on: [{
                        __typeName: "File",
                        ...(type === 'text' ? { content: true } : { base64Content: true })
                    }]
                }
            }
        }
    }).then(resp => {
        const node = resp.app.fs.node;

        // 1. 安全檢查：確保 node 存在且是 File
        if (node?.__typename === "File") {
            // 2. 根據請求的類型回傳對應欄位
            return type === 'text' ? node.content : node.base64Content;
        }

        // 3. 如果是 Folder 或不存在，回傳 null 或拋出異常
        return null;
    });
}

export const uploadBase64 = (location: string, base64: string) => {
    return mutation({
        lightFSUploadBase64: {
            __args: { location, base64 },
            // 回傳 File 物件的欄位，方便前端立即顯示
            __typename: true,
            name: true,
            path: true,
            location: true,
            __on: [{
                __typename: "File",
                size: true,
                mimeType: true,
                lastModified: true
            }]
        }
    }).then(resp => resp.lightFSUploadBase64);
}