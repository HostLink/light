import { query } from "."
export const getConfig = (name: string) => {
    return query({
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
