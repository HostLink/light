import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';
import { getAxios } from './axios';
import { Fields, toQuery, getApiUrl } from '.';

function arrayHasFile(arr: any[]): boolean {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] instanceof File) {
            return true;
        }
    }
    return false;
}

function objectHasFile(obj: any): boolean {
    for (let key in obj) {
        if (obj[key] instanceof File) {
            return true;
        }
    }
    return false;
}

export default async (operation: string, args: { [key: string]: any } | null = null, fields: Fields = []): Promise<any> => {

    let mutation: any = {
        [operation]: {}
    };

    const fd = new FormData();
    let hasFile = false;

    if (args) {
        const __args: any = {}

        //check if args has File

        const map: { [key: number]: string[] } = {};
        const variables: any = {};


        let i = 0;
        Object.entries(args).forEach(([key, value]) => {


            //check if value is array of File
            if (value instanceof Array && arrayHasFile(value)) {
                hasFile = true;
                let j = 0;
                value.forEach((v) => {
                    if (v instanceof File) {
                        __args[key] = new VariableType(key);
                        map[i] = ["variables." + key + "." + j];
                        fd.append(i.toString(), v);
                        i++;
                    }
                })
                variables[key] = "[Upload!]!";

            } else if (value instanceof File) {
                hasFile = true;
                __args[key] = new VariableType(key);
                map[i] = ["variables." + key];
                fd.append(i.toString(), value);
                variables[key] = "Upload!";
                i++;
            } else if (value instanceof Object && objectHasFile(value)) {
                hasFile = true;
                __args[key] = {};
                Object.entries(value).forEach(([k, v]) => {
                    if (v instanceof File) {
                        __args[key][k] = new VariableType(k);
                        map[i] = ["variables." + k];
                        fd.append(i.toString(), v);
                        variables[k] = "Upload!";
                        i++;
                    } else {
                        __args[key][k] = v;
                    }
                })

            } else {
                if (value !== undefined) {
                    __args[key] = value;
                }
            }
        });

        mutation[operation].__args = __args;
        mutation.__variables = variables;
        if (hasFile) {
            fd.append("map", JSON.stringify(map));
        }
    }

    Object.entries(toQuery(fields)).forEach(([field, value]) => {
        mutation[operation][field] = value;
    });


    if (Object.entries(mutation[operation]).length === 0) {
        mutation[operation] = true
    }


    let resp = null;
    const graphql_query = jsonToGraphQLQuery({ mutation });

    if (hasFile) {
        fd.append("operations", JSON.stringify({
            query: graphql_query
        }))
        resp = await getAxios().post(getApiUrl(), fd)
    } else {
        resp = await getAxios().post(getApiUrl(), {
            query: graphql_query
        })
    }


    if (resp.data.errors) {
        throw new Error(resp.data.errors[0].message);
    }

    return resp.data.data[operation];
}