import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import { getAxios } from './axios';
import { Fields, toQuery, getApiUrl } from '.';

export default async (operation: string, args: any = null, fields: Fields = [], mutation: { [key: string]: any } = {}): Promise<any> => {

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


    const resp = await getAxios().post(getApiUrl(), {
        query: jsonToGraphQLQuery({ mutation })
    })

    if (resp.data.errors) {
        throw new Error(resp.data.errors[0].message);
    }

    return resp.data.data[operation];
}