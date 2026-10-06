import { afterEach, expect, it, vi } from 'vitest';
import { createClient, setApiClient, webAuthn } from './index';

afterEach(() => vi.unstubAllGlobals());

it('sends registration through the default mutation after obtaining a credential', async () => {
    const client = createClient('https://example.test/graphql');
    setApiClient(client);
    const registration = { id: 'credential-id', response: {} };
    vi.stubGlobal('PublicKeyCredential', {
        parseCreationOptionsFromJSON: vi.fn(options => options),
    });
    vi.stubGlobal('navigator', {
        credentials: { create: vi.fn(async () => ({ toJSON: () => registration })) },
    });
    const adapter = vi.fn(async (config: any) => ({
        data: { data: JSON.parse(config.data).query.startsWith('mutation')
            ? { webAuthnRegister: true }
            : { app: { auth: { webAuthnCreationOptions: { challenge: 'test' } } } } },
        status: 200, statusText: 'OK', headers: {}, config,
    }));
    client.axios.defaults.adapter = adapter;

    await expect(webAuthn.register()).resolves.toBe(true);
    expect(adapter).toHaveBeenCalledTimes(2);
    expect(JSON.parse(adapter.mock.calls[1][0].data).query).toContain('webAuthnRegister');
});
