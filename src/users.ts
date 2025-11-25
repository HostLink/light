import { createList, mutation } from "."



export type UserFields = {
    user_id?: number
    username?: string
    first_name?: string
    last_name?: string
    status?: number
    password?: string
    join_date?: string
}

type QueryUserFieldsUserFields = Partial<Record<keyof UserFields, boolean>>;

const defaultUserFields: QueryUserFieldsUserFields = {
    user_id: true,
    username: true,
    first_name: true,
    last_name: true,
    status: true
}

const createUser = (fields: UserFields) => mutation({
    createUser: {
        __args: {},
        ...fields
    }
}).then(res => res.createUser)


const deleteUser = (id: Number): Promise<boolean> => mutation({
    deleteUser: {
        __args: { id }
    }
}).then(res => res.deleteUser)


export default () => {
    return {
        list: async (fields: QueryUserFieldsUserFields = defaultUserFields) => {
            return createList("Users", fields).dataPath("app.listUser").fetch();
        },
        create: (fields: UserFields) => createUser(fields),
        delete: (id: Number): Promise<boolean> => deleteUser(id)

    }
}

