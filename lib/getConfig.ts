import query from "./query"

export default async (name: string): Promise<any> => {
    const resp = await query({
        config: {
            __args: {
                name
            }
        }
    })

    return resp.config;

}