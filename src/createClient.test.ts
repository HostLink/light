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
});

function responseFor(config: any, marker: string) {
    const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    const graphQL = body.query as string;

    if (graphQL.includes('ping')) return { ping: marker };
    if (graphQL.includes('login')) return { login: marker };
    if (graphQL.includes('deleteThing')) return { deleteThing: marker };
    return { listThing: { data: [{ id: marker }] } };
}
