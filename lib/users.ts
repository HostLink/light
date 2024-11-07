import { AxiosInstance } from "axios";
import { createCollection } from "."

export type UserFields = {
    user_id?: boolean;
    username?: boolean;
    first_name?: boolean;
    last_name?: boolean;
    status?: boolean;
}

export default (axios: AxiosInstance) => {
    return {
        list: async (fields: UserFields = {
            user_id: true,
            username: true,
            first_name: true,
            last_name: true,
            status: true
        }) => {
            const c = createCollection("Users", axios, fields)
            c.data_path = "app.users";
            return c.all();
        }
    }
}
