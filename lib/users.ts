import { AxiosInstance } from "axios";
import { query } from "."
export default (axios: AxiosInstance) => {
    return {
        list: async () => {
            const data = await query(axios, {
                listUser: {
                    data: {
                        user_id: true,
                        username: true,
                        first_name: true,
                        last_name: true,
                        status: true,
                    }
                }
            });
            return data.listUser.data;
        }
    }
}
