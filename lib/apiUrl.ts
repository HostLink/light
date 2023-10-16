let api_url = "/api/"

const setApiUrl = (url: string) => {
    api_url = url;
}

const getApiUrl = (): string => {
    return api_url;
}

export {
    setApiUrl,
    getApiUrl
}