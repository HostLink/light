import { query } from "."
export const getConfig = (name: string) => {
    return query({
        config: {
            __args: {
                name
            }
        }
    }).then((resp: any) => resp.config);
}
