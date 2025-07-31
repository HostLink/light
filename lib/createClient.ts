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
    collects(collections: { [key: string]: any }): Promise<{ [key: string]: any }>;
}
export default (baseURL: string): LightClient => {

    // 檢測是否在 Node.js 環境中
    const isNodeEnvironment = typeof window === 'undefined';
    let savedCookies: string[] = [];

    const _axios = axios.create({
        baseURL,
        withCredentials: true,
    });

    // 只在 Node.js 環境中啟用手動 cookie 管理
    if (isNodeEnvironment) {
        // 添加請求攔截器來手動設置 cookies
        _axios.interceptors.request.use((config) => {
            config.withCredentials = true;
            if (savedCookies.length > 0) {
                config.headers.Cookie = savedCookies.join('; ');
            }
            return config;
        });

        // 添加響應攔截器來手動保存 cookies
        _axios.interceptors.response.use((response) => {
            if (response.headers['set-cookie']) {
                // 手動保存 cookies，保留現有的 cookies 並添加新的
                const newCookies = response.headers['set-cookie'].map((cookie: string) => {
                    // 提取 cookie 名稱和值（移除額外的屬性）
                    return cookie.split(';')[0];
                });
                
                // 合併現有 cookies 和新 cookies，避免重複
                const existingCookieNames = savedCookies.map(cookie => cookie.split('=')[0]);
                const filteredNewCookies = newCookies.filter(newCookie => {
                    const cookieName = newCookie.split('=')[0];
                    return !existingCookieNames.includes(cookieName);
                });
                
                savedCookies = [...savedCookies, ...filteredNewCookies];
            }
            return response;
        });
    }

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
        },
        async collects(collections: { [key: string]: any }) {
            // 1. 收集所有 payload
            const payload: any = {};
            const dataPath: any = {};
            for (const key in collections) {
                const p = collections[key].getQueryPayload()

                dataPath[key] = p.data_path;

                payload[key] = {};
            

                const t = p.data_path.split('.');
                //payload[key].__aliasFor =  t[0]; // 這行是為了讓後端知道這個 query 是屬於哪個 collection 的

                let last_key = t[t.length - 1];
                let current = payload[key]

                for (const k of t) {
                    if (k === last_key) {
                        current[k] = p.query;
                        break;
                    }
                    current[k] = current[k] || {}
                }
                payload[key].__aliasFor = t[0]; // 這行是為了讓後端知道這個 query 是屬於哪個 collection 的


            }


            // 2. 發送 batch request
            const data = await query(_axios, payload);
            
            // 3. 將 data 設返入每個 collection
            for (const key in collections) {

                //map the datapath to _batchData
                const t = dataPath[key].split('.');
                let last_key = t[t.length - 1];
                let current =data[key]
                for (const k of t) {
                    if (k === last_key) {
                        collections[key]._batchData = data[key][k];
                        break;
                    }
                    current[k] = current[k] || {}
                    
                }
                               
            }
            return collections;
        }
    }
}