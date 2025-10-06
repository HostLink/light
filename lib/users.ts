import { AxiosInstance } from "axios";
import { createList } from "."

export type UserFields = {
    user_id?: boolean;
    username?: boolean;
    first_name?: boolean;
    last_name?: boolean;
    status?: boolean;
}

export default (axios: AxiosInstance) => {
    return {
        list: (fields: UserFields = {
            user_id: true,
            username: true,
            first_name: true,
            last_name: true,
            status: true
        }) => {
            return createList(axios, "Users", fields).dataPath("app.users");
        }
    }
}
