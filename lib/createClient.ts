import { default as auth } from './auth';

import { AxiosInstance } from 'axios';
import axios from "axios";
import { default as mutation } from './mutation';
import { default as query } from './query';
import { Fields } from '.';
import { default as _config } from './config';
import { default as _mail } from './mail';
import { default as _users } from './users';
import { default as _fs } from './fs';

export interface LightClient {
    axios: AxiosInstance;
    auth: ReturnType<typeof auth>;
    mutation: (operation: string, args: { [key: string]: any } | null, fields: Fields) => Promise<any>;
    query: (q: Object | Array<string | Object | string>) => Promise<any>;
    config: ReturnType<typeof _config>;
    mail: ReturnType<typeof _mail>;
    users: ReturnType<typeof _users>;
    fs: ReturnType<typeof _fs>;
}

export default (baseURL: string): LightClient => {

    const _axios = axios.create({
        baseURL,
        withCredentials: true,
    });

    const _mutation = (operation: string, args: { [key: string]: any } | null = null, fields: Fields = []) => {
        return mutation(_axios, operation, args, fields);
    }

    const _query = (q: Object | Array<string | Object | string>) => {
        return query(_axios, q);
    }

    return {
        axios: _axios,
        auth: auth(_axios),
        mutation: _mutation,
        query: _query,
        config: _config(_query),
        mail: _mail(_axios),
        users: _users(_axios),
        fs: _fs(_axios),

    }
}