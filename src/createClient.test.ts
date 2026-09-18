import { describe, expect, it, vi } from 'vitest';
import { createClient } from './createClient';

describe('createClient instance isolation', () => {
    it('keeps query, auth, list, and model operations on their own transport', async () => {
        const first = createClient('https://first.example/graphql');
        const second = createClient('https://second.example/graphql');

        const firstAdapter = vi.fn(async (config: any) => ({
            data: { data: responseFor(config, 'first') },
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
        }));
        const secondAdapter = vi.fn(async (config: any) => ({
            data: { data: responseFor(config, 'second') },
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
        }));

        first.axios.defaults.adapter = firstAdapter;
        second.axios.defaults.adapter = secondAdapter;

        expect(await first.query({ ping: true })).toEqual({ ping: 'first' });
        expect(await second.auth.login('user', 'password')).toBe('second');
        expect(await first.list('Thing', { id: true }).fetch()).toEqual([{ id: 'first' }]);
        expect(await second.model('Thing').delete(1)).toBe('second');

        expect(firstAdapter).toHaveBeenCalledTimes(2);
        expect(secondAdapter).toHaveBeenCalledTimes(2);
        expect(firstAdapter.mock.calls.every(([config]) => config.baseURL === 'https://first.example/graphql')).toBe(true);
        expect(secondAdapter.mock.calls.every(([config]) => config.baseURL === 'https://second.example/graphql')).toBe(true);
    });

    it('lazily exchanges and attaches an audience token', async () => {
        const auth = createClient('https://auth.example/graphql');
        const business = createClient('https://business.example/graphql');
        let exchanges = 0;
        let audienceToken = fakeToken(Math.floor(Date.now() / 1000) + 300, exchanges);

        const authAdapter = vi.fn(async (config: any) => {
            const graphQL = JSON.parse(config.data).query as string;
            const data = graphQL.includes('createAudienceAccessToken')
                ? { createAudienceAccessToken: (audienceToken = fakeToken(Math.floor(Date.now() / 1000) + 300, ++exchanges)) }
                : { login: true };
            return { data: { data }, status: 200, statusText: 'OK', headers: {}, config };
        });
        const businessAdapter = vi.fn(async (config: any) => ({
            data: { data: { orders: [] } },
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
        }));
        auth.axios.defaults.adapter = authAdapter;
        business.axios.defaults.adapter = businessAdapter;
        business.useAudience(auth, 'business-api');

        await business.query({ orders: true });
        await business.query({ orders: true });

        expect(authAdapter).toHaveBeenCalledTimes(1);
        expect(JSON.parse(authAdapter.mock.calls[0][0].data).query).toContain('business-api');
        expect(businessAdapter).toHaveBeenCalledTimes(2);
        expect(businessAdapter.mock.calls[0][0].headers.Authorization).toBe(`Bearer ${audienceToken}`);
        expect(businessAdapter.mock.calls[1][0].headers.Authorization).toBe(`Bearer ${audienceToken}`);

        await auth.auth.login('next-user', 'password');
        await business.query({ orders: true });

        expect(exchanges).toBe(2);
        expect(businessAdapter.mock.calls[2][0].headers.Authorization).toBe(`Bearer ${audienceToken}`);
    });
});

function responseFor(config: any, marker: string) {
    const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    const graphQL = body.query as string;

    if (graphQL.includes('ping')) return { ping: marker };
    if (graphQL.includes('login')) return { login: marker };
    if (graphQL.includes('deleteThing')) return { deleteThing: marker };
    return { listThing: { data: [{ id: marker }] } };
}

function fakeToken(exp: number, sequence = 0) {
    const encode = (value: object) => globalThis.btoa(JSON.stringify(value))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    return `${encode({ alg: 'RS256' })}.${encode({ exp, sequence })}.signature`;
}
