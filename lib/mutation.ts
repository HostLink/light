import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import { getAxios } from './axios';
import getApiUrl from './getApiUrl';
import { Fields, toQuery } from '.';

export default async (operation: string, args: any = null, fields: Fields = []): Promise<any> => {

    const mutation: any = {
        mutation: {

        }
    }
    mutation.mutation[operation] = true;


    if (fields instanceof Array && fields.length != 0) {
        mutation.mutation[operation] = {};
    }

    if (args) {
        mutation.mutation[operation] = {};
        mutation.mutation[operation].__args = args;
    }

    Object.entries(toQuery(fields)).forEach(([field, value]) => {
        mutation.mutation[operation][field] = value;
    });


    const resp = await getAxios().post(getApiUrl(), {
        query: jsonToGraphQLQuery(mutation)
    })

    if (resp.data.errors) {
        throw new Error(resp.data.errors[0].message);
    }

    return resp.data.data[operation];
}