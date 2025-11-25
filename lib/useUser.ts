import type { AxiosInstance } from "axios";
import { createList, mutation } from "."

export type UserFields = {
    user_id?: boolean;
    username?: boolean;
    first_name?: boolean;
    last_name?: boolean;
    status?: boolean;
    password?: boolean;
    join_date?: boolean;
}

const createUser = (axios: AxiosInstance, fields: UserFields) => mutation(axios, {
    createUser: {
        __args: {},
        ...fields
    }
}).then(res => res.createUser)


const deleteUser = (axios: AxiosInstance, id: Number): Promise<boolean> => mutation(axios, {
    deleteUser: {
        __args: { id }
    }
}).then(res => res.deleteUser)


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
        },
        create: (fields: UserFields) => createUser(axios, fields),
        delete: (id: Number): Promise<boolean> => deleteUser(axios, id)

    }
}
