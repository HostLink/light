import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import axios from 'axios';
import getApiUrl from './getApiUrl';


export default async (operation: string, args: any = null, fields: Array<any> = []): Promise<any> => {

    const service = axios.create({
        withCredentials: true
    });

    const mutation: any = {
        mutation: {

        }
    }
    mutation.mutation[operation] = true;

    if (args) {
        mutation.mutation[operation] = {};
        mutation.mutation[operation].__args = args;
    }


    if (fields.length > 0) {
        mutation.mutation[operation] = {};
    }

    fields.forEach(field => {
        mutation.mutation[operation][field] = true;
    });

    const resp = await service.post(getApiUrl(), {
        query: jsonToGraphQLQuery(mutation)
    })

    if (resp.data.errors) {
        throw new Error(resp.data.errors[0].message);
    }

    return resp.data.data;
}