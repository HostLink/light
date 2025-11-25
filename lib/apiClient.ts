import { LightClient } from './createClient';

let apiClient: LightClient | null = null;

export const setApiClient = (client: LightClient) => {
    apiClient = client;
};

export const getApiClient = (): LightClient => {
    if (!apiClient) {
        throw new Error("Api client not initialized. Call setApiClient() first.");
    }
    return apiClient;
};

export const getApiClientOptional = (): LightClient | null => {
    return apiClient;
};
