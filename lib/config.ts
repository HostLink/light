export default (query: any) => {
    return {
        get: async (name: string): Promise<any> => {
            const resp = await query({
                config: {
                    __args: {
                        name
                    }
                }
            })
            return resp.config;
        }
    }
}