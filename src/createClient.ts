import { default as auth } from './auth';
import { getDrive } from './drive';

import axios from "axios";
import { default as mutation } from './mutation';
import { default as query } from './query';
import { setApiClient } from '.';
import { getConfig } from './config';
import { default as mail } from './mail';
import { getModel } from './models';
import { default as roles } from './role';
import { default as createCollection } from './createCollection';
import createList from './createList';

import { default as users } from './users';

type ClientType = {
    post: typeof axios.post;
    baseURL: string;
    axios: ReturnType<typeof axios.create>;
    auth: typeof auth;
    mutation: typeof mutation;
    query: typeof query;
    config: typeof getConfig;
    mail: typeof mail;
    users: typeof users;
    model: (name: string) => ReturnType<typeof getModel>;
    roles: ReturnType<typeof roles>;
    collect: (name: string, fields: Record<string, any>) => ReturnType<typeof createCollection> & { data_path: string };
    list: (entity: string, fields: Record<string, any>) => ReturnType<typeof createList>;
    drive: typeof getDrive;
    collects: (collections: { [key: string]: any }) => Promise<{ [key: string]: any }>;
};

export const createClient = (baseURL: string) => {

    // 檢測是否在 Node.js 環境中
    const isNodeEnvironment = typeof window === 'undefined';
    let savedCookies: string[] = [];

    const _axios = axios.create({
        baseURL,
        withCredentials: true,
    });

    let isRefreshing = false;
    let failedQueue: any[] = [];

    // 處理重試隊列：當刷新成功後，把剛才失敗的請求全部重新發送
    const processQueue = (error: any, token = null) => {
        failedQueue.forEach(prom => {
            if (error) prom.reject(error);
            else prom.resolve(token);
        });
        failedQueue = [];
    };

    _axios.interceptors.response.use(
        (response) => {
            // GraphQL 通常回傳 200 OK，所以要檢查 response.data.errors
            const errors = response.data.errors;
            if (errors && errors.some((e: any) => e.extensions?.code === 'TOKEN_EXPIRED')) {
                const originalRequest = response.config;

                if (!isRefreshing) {
                    isRefreshing = true;

                    // 呼叫後端的 Refresh Mutation
                    return refreshAccessToken()
                        .then(() => {
                            isRefreshing = false;
                            processQueue(null);
                            // 刷新成功，重新執行原本失敗的請求
                            return _axios(originalRequest);
                        })
                        .catch((err) => {
                            isRefreshing = false;
                            processQueue(err);
                            // 如果連 Refresh 也失敗（例如 RT 也過期），就跳轉到登入頁
                            window.location.href = '/login';
                            return Promise.reject(err);
                        });
                }

                // 如果已經在刷新中，將其他請求放入隊列等待
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => _axios(originalRequest))
                    .catch(err => Promise.reject(err));
            }
            return response;
        },
        (error) => {
            // 這裡處理 HTTP 401 等傳統錯誤
            return Promise.reject(error);
        }
    );

    // 呼叫刷新 Mutation 的函式
    async function refreshAccessToken() {

        console.log("Refreshing access token...");
        return await _axios.post('/refresh_token').then((response) => {
            console.log(response.data);
            return response;
        })
    }

    // 只在 Node.js 環境中啟用手動 cookie 管理
    if (isNodeEnvironment) {
        // 添加請求攔截器來手動設置 cookies
        _axios.interceptors.request.use((config) => {
            config.withCredentials = true;
            console.log("Attaching cookies:", savedCookies);
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

    const client: ClientType = {
        post: _axios.post,
        baseURL,
        axios: _axios,
        auth,
        mutation,
        query,
        config: getConfig,
        mail,
        users,
        model(name: string) {
            return getModel(name);
        },
        roles: roles(),
        collect: (name: string, fields: Record<string, any>) => {
            const c = createCollection(name, fields);
            c.data_path = getModel(name).getDataPath();
            return c;
        },
        list: (entity: string, fields: Record<string, any>) => {
            const l = createList(entity, fields);
            return l.dataPath(getModel(entity).getDataPath());
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

export type LightClient = ReturnType<typeof createClient>;