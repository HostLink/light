export default (query: any) => {
    return {
        get: (name: string): Promise<any> => {
            return query({
                config: {
                    __args: {
                        name
                    }
                }
            }).then((resp: any) => resp.config);
        }
    }
}