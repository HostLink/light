import { default as auth } from './auth';
import { getDrive } from './drive';

import { AxiosInstance } from 'axios';
import axios from "axios";
import { default as mutation } from './mutation';
import { default as query } from './query';
import { Fields, setApiClient } from '.';
import { getConfig } from './config';
import { default as mail } from './mail';
import { createModelManager, type ModelManager } from './useModel';
import { default as model } from './model';
import { default as roles } from './role';
import { default as createCollection } from './createCollection';
import createList from './createList';

import { default as users } from './users';
export interface LightClient {
    baseURL: string;
    axios: AxiosInstance;
    auth: ReturnType<typeof auth>;
    mutation: (q: Record<string, any>) => Promise<any>;
    query: (q: Record<string, any>) => Promise<any>;
    config: typeof getConfig;
    mail: typeof mail;
    users: ReturnType<typeof users>;
    models: ModelManager;
    model(name: string): ReturnType<typeof model>;
    roles: ReturnType<typeof roles>;
    collect(name: string, fields: Record<string, any>): ReturnType<typeof createCollection>;
    drive(index: number): ReturnType<typeof getDrive>;
    collects(collections: { [key: string]: any }): Promise<{ [key: string]: any }>;
    list(entity: string, fields: Fields): ReturnType<typeof createList>;
    post: AxiosInstance['post'];
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

                // 使用 Map 來合併 cookies，新的 cookie 會覆蓋舊的同名 cookie
                const cookieMap = new Map<string, string>();

                // 先加入現有的 cookies
                savedCookies.forEach(cookie => {
                    const cookieName = cookie.split('=')[0];
                    cookieMap.set(cookieName, cookie);
                });

                // 用新的 cookies 覆蓋或添加
                newCookies.forEach(cookie => {
                    const cookieName = cookie.split('=')[0];
                    cookieMap.set(cookieName, cookie);
                });

                savedCookies = Array.from(cookieMap.values());
            }
            return response;
        });
    }

    const _models = createModelManager();

    const client = {
        post: _axios.post,
        baseURL,
        axios: _axios,
        auth: auth(),
        mutation,
        query,
        config: getConfig,
        mail,
        users: users(),
        models: _models,
        model(name: string) {
            return _models.get(name);
        },
        roles: roles(),
        collect: (name: string, fields: Record<string, any>) => {
            const c = createCollection(name, fields);
            c.data_path = _models.get(name).getDataPath();
            return c;
        },
        list: (entity: string, fields: Record<string, any>) => {
            const l = createList(entity, fields);
            return l.dataPath(_models.get(entity).getDataPath());
        },
        drive: getDrive,
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
            const data = await query(payload);

            // 3. 將 data 設返入每個 collection
            for (const key in collections) {
                //map the datapath to _batchData
                const t = dataPath[key].split('.');
                let last_key = t[t.length - 1];
                let current = data[key]
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

    setApiClient(client);
    return client;
}