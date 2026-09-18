import { createAuth } from './auth';
import { createDrive } from './drive';

import axios from "axios";
import { createMutation } from './mutation';
import { createQuery } from './query';
import { setApiClient } from '.';
import { createConfig } from './config';
import { createMail } from './mail';
import { getModel } from './models';
import { createRoles } from './role';
import { default as createCollection } from './createCollection';
import createList from './createList';

import { createUsers } from './users';
import createModel from './model';

export type AccessTokenProvider = () => Promise<string>;

type ClientType = {
    post: typeof axios.post;
    baseURL: string;
    axios: ReturnType<typeof axios.create>;
    setAccessToken: (token: string | null) => void;
    getAccessToken: () => string | null;
    clearAccessToken: () => void;
    setAccessTokenProvider: (provider: AccessTokenProvider | null) => void;
    onAuthChange: (listener: () => void) => () => void;
    useAudience: (authClient: ClientType, audience: string) => void;
    auth: ReturnType<typeof createAuth>;
    mutation: ReturnType<typeof createMutation>;
    query: ReturnType<typeof createQuery>;
    config: ReturnType<typeof createConfig>;
    mail: ReturnType<typeof createMail>;
    users: ReturnType<typeof createUsers>;
    model: (name: string) => ReturnType<typeof getModel>;
    roles: ReturnType<typeof createRoles>;
    collect: (name: string, fields: Record<string, any>) => ReturnType<typeof createCollection> & { data_path: string };
    list: (entity: string, fields: Record<string, any>) => ReturnType<typeof createList>;
    /**
     * @deprecated Use `fs.*` from `filesystem` instead.
     */
    drive: ReturnType<typeof createDrive>;
    collects: (collections: { [key: string]: any }) => Promise<{ [key: string]: any }>;
};

export const createClient = (baseURL: string) => {

    // 檢測是否在 Node.js 環境中
    const isNodeEnvironment = typeof window === 'undefined';
    let savedCookies: string[] = [];
    let accessToken: string | null = null;
    let accessTokenProvider: AccessTokenProvider | null = null;
    let tokenPromise: Promise<string> | null = null;
    let unsubscribeAuthChange: (() => void) | null = null;
    const authChangeListeners = new Set<() => void>();

    const _axios = axios.create({
        baseURL,
        withCredentials: true,
    });

    const resolveAccessToken = async (): Promise<string | null> => {
        if (accessToken && !isTokenExpiring(accessToken)) return accessToken;
        if (!accessTokenProvider) return accessToken;

        tokenPromise ??= accessTokenProvider().then((token) => {
            accessToken = token;
            return token;
        }).finally(() => {
            tokenPromise = null;
        });
        return tokenPromise;
    };

    _axios.interceptors.request.use(async (config) => {
        const token = await resolveAccessToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
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
                if ((originalRequest as any)._lightTokenRetried) return response;
                (originalRequest as any)._lightTokenRetried = true;

                if (accessTokenProvider) accessToken = null;

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
    function refreshAccessToken() {
        if (accessTokenProvider) return resolveAccessToken().then(() => undefined);
        return _axios.post('/refresh_token')
    }

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

    const query = createQuery(_axios);
    const mutation = createMutation(_axios);
    const boundList = (entity: string, fields: Record<string, any>) => createList(entity, fields, query);
    const boundCollection = (name: string, fields: Record<string, any>) => createCollection(name, fields, query);
    const boundModel = (name: string) => {
        const definition = getModel(name);
        const instance = createModel(name, definition.$fields, {
            mutation,
            createList: boundList,
            createCollection: boundCollection,
        });
        instance.setDataPath(definition.getDataPath());
        return instance;
    };
    const baseAuth = createAuth(query, mutation);
    const notifyAuthChange = () => authChangeListeners.forEach((listener) => listener());
    const afterAuthChange = <T extends (...args: any[]) => Promise<any>>(operation: T): T => (
        async (...args: Parameters<T>) => {
            const result = await operation(...args);
            notifyAuthChange();
            return result;
        }
    ) as T;
    const auth: ReturnType<typeof createAuth> = {
        ...baseAuth,
        login: afterAuthChange(baseAuth.login),
        logout: (async () => {
            try {
                return await baseAuth.logout();
            } finally {
                notifyAuthChange();
            }
        }) as typeof baseAuth.logout,
        google: { ...baseAuth.google, login: afterAuthChange(baseAuth.google.login) },
        facebook: { ...baseAuth.facebook, login: afterAuthChange(baseAuth.facebook.login) },
        microsoft: { ...baseAuth.microsoft, login: afterAuthChange(baseAuth.microsoft.login) },
        webAuthn: { ...baseAuth.webAuthn, login: afterAuthChange(baseAuth.webAuthn.login) },
    };

    const client: ClientType = {
        post: _axios.post.bind(_axios),
        baseURL,
        axios: _axios,
        setAccessToken(token: string | null) {
            accessToken = token;
        },
        getAccessToken() {
            return accessToken;
        },
        clearAccessToken() {
            accessToken = null;
        },
        setAccessTokenProvider(provider: AccessTokenProvider | null) {
            unsubscribeAuthChange?.();
            unsubscribeAuthChange = null;
            accessTokenProvider = provider;
            accessToken = null;
            tokenPromise = null;
        },
        onAuthChange(listener: () => void) {
            authChangeListeners.add(listener);
            return () => authChangeListeners.delete(listener);
        },
        useAudience(authClient: ClientType, audience: string) {
            unsubscribeAuthChange?.();
            accessTokenProvider = async () => {
                const response = await authClient.mutation({
                    createAudienceAccessToken: {
                        __args: { audience },
                    },
                });
                return response.createAudienceAccessToken;
            };
            accessToken = null;
            tokenPromise = null;
            unsubscribeAuthChange = authClient.onAuthChange(() => {
                accessToken = null;
                tokenPromise = null;
            });
        },
        auth,
        mutation,
        query,
        config: createConfig(query),
        mail: createMail(mutation),
        users: createUsers(mutation, boundList),
        model(name: string) {
            return boundModel(name);
        },
        roles: createRoles(query, mutation),
        collect: (name: string, fields: Record<string, any>) => {
            const c = boundCollection(name, fields);
            c.data_path = getModel(name).getDataPath();
            return c;
        },
        list: (entity: string, fields: Record<string, any>) => {
            const l = boundList(entity, fields);
            return l.dataPath(getModel(entity).getDataPath());
        },
        /**
         * @deprecated Use `fs.*` from `filesystem` instead.
         */
        drive: createDrive(query, mutation),
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

function isTokenExpiring(token: string, leewaySeconds = 30): boolean {
    try {
        const payload = token.split('.')[1];
        if (!payload) return true;
        const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
        const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
        const decoded = JSON.parse(globalThis.atob(padded));
        return typeof decoded.exp === 'number'
            ? decoded.exp <= Math.floor(Date.now() / 1000) + leewaySeconds
            : false;
    } catch {
        return true;
    }
}
