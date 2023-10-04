import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import axios from 'axios';
import toQuery from './toQuery';
import getApiUrl from './getApiUrl';

export default async (q: Object): Promise<any> => {

    const service = axios.create({
        withCredentials: true
    });

    let query = jsonToGraphQLQuery(toQuery(q));

    const resp = await service.post(getApiUrl(), {
        query: `{ ${query} }`
    })

    if (resp.data.errors) {
        throw new Error(resp.data.errors[0].message);
    }

    return resp.data.data;
}
