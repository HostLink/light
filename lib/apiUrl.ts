let api_url = "/api/"

export const setApiUrl = (url: string) => {
    api_url = url;
}

export const getApiUrl = (): string => {
    return api_url;
}