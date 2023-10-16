import axios from 'axios';
import { jsonToGraphQLQuery, VariableType } from "json-to-graphql-query";
import { getApiUrl } from '.';
import { getAxios } from './axios';


export default async function (file: File): Promise<any> {
    const mutation = {
        __variables: {
            file: "Upload!"
        },
        fsUploadTempFile: {
            __args: {
                file: new VariableType("file")
            },
            name: true,
            path: true,
            size: true,
            mime: true,
        }
    }

    const formData = new FormData();
    formData.append('operations', JSON.stringify({
        query: jsonToGraphQLQuery({ mutation })
    }));
    formData.append('map', JSON.stringify({ "0": ["variables.file"] }));
    formData.append('0', file);

    const resp = await getAxios().post(getApiUrl(), formData);
    if (resp.data.errors) {
        throw new Error(resp.data.errors[0].message);
    }

    return resp.data.data.fsUploadTempFile;


}
