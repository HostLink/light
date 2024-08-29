import { AxiosInstance } from "axios";
import { query } from "."


export default (axios: AxiosInstance) => {

    return {
        list: async () => {
            const data = await query(axios, {
                listRole: {
                    name: true,
                }
            });
            return data.listRole;
        }
    }
}