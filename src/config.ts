import { query } from "."
export const createConfig = (queryFn: typeof query) => (name: string) => {
    return queryFn({
        app: {
            listConfig: {
                __args: {
                    filters: {
                        name: name
                    }

                },
                data: {
                    name: true,
                    value: true
                }
            }
        }
    }).then((resp: any) => resp.app.listConfig.data[0]?.value);
}

export const getConfig = createConfig(query)
