import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';
import { AxiosInstance } from 'axios';

import { arrayHasFile, objectHasFile } from './fileUtils';

// Recursive function to process __args at all levels
function processArgs(obj: any, allVariables: any, map: any, fd: FormData, fileIndexRef: { current: number }) {
    if (!obj || typeof obj !== 'object') {
        return;
    }

    for (let key in obj) {
        const field = obj[key];
        if (field && typeof field === 'object') {
            // Process __args if exists
            if ('__args' in field) {
                const args = field.__args;
                const __args: any = {};

                Object.entries(args).forEach(([argKey, value]) => {
                    // Check if value is array of File
                    if (value instanceof Array && arrayHasFile(value)) {
                        __args[argKey] = new VariableType(argKey);
                        let j = 0;
                        value.forEach((v) => {
                            if (v instanceof File) {
                                if (!map[fileIndexRef.current]) {
                                    map[fileIndexRef.current] = [];
                                }
                                map[fileIndexRef.current].push("variables." + argKey + "." + j);
                                fd.append(fileIndexRef.current.toString(), v);
                                fileIndexRef.current++;
                                j++;
                            }
                        })
                        allVariables[argKey] = "[Upload!]!";

                    } else if (value instanceof File) {
                        __args[argKey] = new VariableType(argKey);
                        map[fileIndexRef.current] = ["variables." + argKey];
                        fd.append(fileIndexRef.current.toString(), value);
                        allVariables[argKey] = "Upload!";
                        fileIndexRef.current++;
                    } else if (value instanceof Object && objectHasFile(value)) {
                        __args[argKey] = {};
                        Object.entries(value).forEach(([k, v]) => {
                            if (v instanceof Array && arrayHasFile(v)) {
                                __args[argKey][k] = new VariableType(k);
                                let j = 0;
                                v.forEach((item) => {
                                    if (item instanceof File) {
                                        if (!map[fileIndexRef.current]) {
                                            map[fileIndexRef.current] = [];
                                        }
                                        map[fileIndexRef.current].push("variables." + k + "." + j);
                                        fd.append(fileIndexRef.current.toString(), item);
                                        fileIndexRef.current++;
                                        j++;
                                    }
                                })
                                allVariables[k] = "[Upload!]!";
                            } else if (v instanceof File) {
                                __args[argKey][k] = new VariableType(k);
                                map[fileIndexRef.current] = ["variables." + k];
                                fd.append(fileIndexRef.current.toString(), v);
                                allVariables[k] = "Upload!";
                                fileIndexRef.current++;
                            } else {
                                __args[argKey][k] = v;
                            }
                        })

                    } else {
                        if (value !== undefined && value !== null) {
                            __args[argKey] = value;
                        }
                    }
                });

                field.__args = __args;
            }

            // Recursively process nested fields
            processArgs(field, allVariables, map, fd, fileIndexRef);
        }
    }
}

export default async (axios: AxiosInstance, q: Record<string, any>): Promise<any> => {

    const convertedQ = q;

    const fd = new FormData();
    let hasFile = false;
    const allVariables: any = {};
    const map: { [key: number]: string[] } = {};
    const fileIndexRef = { current: 0 };

    // Process __args recursively at all levels
    processArgs(convertedQ, allVariables, map, fd, fileIndexRef);

    hasFile = Object.keys(allVariables).length > 0;

    if (hasFile) {
        convertedQ.__variables = allVariables;
    }

    let resp = null;
    const query: any = { query: convertedQ };
    const graphql_query = jsonToGraphQLQuery(query);

    if (hasFile) {
        fd.append("map", JSON.stringify(map));
        fd.append("operations", JSON.stringify({
            query: graphql_query
        }))
        resp = await axios.post("", fd)
    } else {
        resp = await axios.post("", {
            query: graphql_query
        })
    }

    if (resp.data.errors) {
        throw new Error(resp.data.errors[0].message);
    }

    return resp.data.data;
}
