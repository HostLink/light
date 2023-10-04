import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import axios from 'axios';
import toQuery from './toQuery';

export default async (q: Object): Promise<any> => {

    const service = axios.create({
        withCredentials: true
    });

    let query = jsonToGraphQLQuery(toQuery(q));


    const url = import.meta.env.VITE_API_URL ?? "/api/"

    const resp = await service.post(url, {
        query: `{ ${query} }`
    })

    if (resp.data.errors) {
        throw new Error(resp.data.errors[0].message);
    }

    return resp.data.data;
}
