import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import { getAxios } from './axios';
import { Fields, toQuery, getApiUrl } from '.';
import { Nullable } from 'vitest';

export default async (operation: string, args: any = null, fields: Fields = [], mutation: { [key: string]: any } = {}, formData: Nullable<FormData> = null): Promise<any> => {

    mutation[operation] = true;


    if (fields instanceof Array && fields.length != 0) {
        mutation[operation] = {};
    }

    if (args) {
        mutation[operation] = {};
        mutation[operation].__args = args;
    }

    Object.entries(toQuery(fields)).forEach(([field, value]) => {
        mutation[operation][field] = value;
    });

    let resp = null;
    const graphql_query = jsonToGraphQLQuery({ mutation });

    if (formData) {
        formData.append("operations", JSON.stringify({
            query: graphql_query
        }))
        resp = await getAxios().post(getApiUrl(), formData)
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