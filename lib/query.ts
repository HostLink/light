import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import toQuery from './toQuery';
import getApiUrl from './getApiUrl';
import { getAxios } from './axios';

export default async (q: Object | Array<string | Object | string>): Promise<any> => {

    let query = jsonToGraphQLQuery(toQuery(q));

    const resp = await getAxios().post(getApiUrl(), {
        query: `{ ${query} }`
    })

    if (resp.data.errors) {
        throw new Error(resp.data.errors[0].message);
    }

    return resp.data.data;
}
