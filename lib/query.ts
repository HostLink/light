import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';
import toQuery from './toQuery';
import { AxiosInstance } from 'axios';

import { arrayHasFile, objectHasFile } from './fileUtils';

export default async (axios: AxiosInstance, q: Object | Array<string | Object>): Promise<any> => {

    const convertedQ = toQuery(q);

    const fd = new FormData();
    let hasFile = false;
    const allVariables: any = {};
    const map: { [key: number]: string[] } = {};
    let fileIndex = 0;

    // Check if any field has __args with File
    for (let key in convertedQ) {
        const field = convertedQ[key];
        if (field && typeof field === 'object' && '__args' in field) {
            const args = field.__args;
            const __args: any = {};

            Object.entries(args).forEach(([argKey, value]) => {
                // Check if value is array of File
                if (value instanceof Array && arrayHasFile(value)) {
                    hasFile = true;
                    let j = 0;
                    value.forEach((v) => {
                        if (v instanceof File) {
                            __args[argKey] = new VariableType(argKey);
                            map[fileIndex] = ["variables." + argKey + "." + j];
                            fd.append(fileIndex.toString(), v);
                            fileIndex++;
                        }
                    })
                    allVariables[argKey] = "[Upload!]!";

                } else if (value instanceof File) {
                    hasFile = true;
                    __args[argKey] = new VariableType(argKey);
                    map[fileIndex] = ["variables." + argKey];
                    fd.append(fileIndex.toString(), value);
                    allVariables[argKey] = "Upload!";
                    fileIndex++;
                } else if (value instanceof Object && objectHasFile(value)) {
                    hasFile = true;
                    __args[argKey] = {};
                    Object.entries(value).forEach(([k, v]) => {
                        if (v instanceof File) {
                            __args[argKey][k] = new VariableType(k);
                            map[fileIndex] = ["variables." + k];
                            fd.append(fileIndex.toString(), v);
                            allVariables[k] = "Upload!";
                            fileIndex++;
                        } else {
                            __args[argKey][k] = v;
                        }
                    })

                } else {
                    if (value !== undefined) {
                        __args[argKey] = value;
                    }
                }
            });

            convertedQ[key].__args = __args;
        }
    }

    if (Object.keys(allVariables).length > 0) {
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
