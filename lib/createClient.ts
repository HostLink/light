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
import { default as models } from './models';
import { default as model } from './model';
import { default as roles } from './roles';
import { default as createCollection } from './createCollection';
import { default as drive } from './drive';


export interface LightClient {
    baseURL: string;
    axios: AxiosInstance;
    auth: ReturnType<typeof auth>;
    mutation: (operation: string, args: { [key: string]: any } | null, fields: Fields) => Promise<any>;
    query: (q: Object | Array<string | Object | string>) => Promise<any>;
    config: ReturnType<typeof _config>;
    mail: ReturnType<typeof _mail>;
    users: ReturnType<typeof _users>;
    fs: ReturnType<typeof _fs>;
    models: ReturnType<typeof models>;
    model(name: string): ReturnType<typeof model>;
    roles: ReturnType<typeof roles>;
    collect(name: string, fields: Object): ReturnType<typeof createCollection>;
    drive(index: number): ReturnType<typeof drive>;
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

    const _models = models(_axios);

    return {
        baseURL,
        axios: _axios,
        auth: auth(_axios),
        mutation: _mutation,
        query: _query,
        config: _config(_query),
        mail: _mail(_axios),
        users: _users(_axios),
        fs: _fs(_axios),
        models: _models,
        model(name: string) {
            return _models.get(name);
        },
        roles: roles(_axios),
        collect: (name: string, fields: Object) => {
            const c = createCollection(name, _axios, fields);
            c.data_path = _models.get(name).getDataPath();
            return c;
        },
        drive(index: number) {
            return drive(index, _axios);
        }
    }
}