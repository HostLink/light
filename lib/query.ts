import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import toQuery from './toQuery';
import { AxiosInstance } from 'axios';

export default async (axios: AxiosInstance, q: Object | Array<string | Object>): Promise<any> => {

    let query = jsonToGraphQLQuery(toQuery(q));

    const resp = await axios.post("", {
        query: `{ ${query} }`
    })

    if (resp.data.errors) {
        throw new Error(resp.data.errors[0].message);
    }

    return resp.data.data;
}
