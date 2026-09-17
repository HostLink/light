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

export type QueryUserFieldsUserFields = Partial<Record<keyof UserFields, boolean>>;

export const defaultUserFields: QueryUserFieldsUserFields = {
    user_id: true,
    username: true,
    first_name: true,
    last_name: true,
    status: true
}

export type CreateUserFields = {
    username: string
    first_name: string
    last_name?: string
    password: string
    join_date: string
}

export const createUser = (fields: CreateUserFields) => mutation({
    addUser: {
        __args: fields
    }
}).then(res => res.addUser)

export const deleteUser = (id: Number): Promise<boolean> => mutation({
    deleteUser: {
        __args: { id }
    }
}).then(res => res.deleteUser)

export const listUsers = (fields: QueryUserFieldsUserFields = defaultUserFields) => {
    return createList("Users", fields).dataPath("app.listUser").fetch();
}

export const updateUser = (id: number, fields: Partial<CreateUserFields>) => mutation({
    updateUser: {
        __args: { id, data: fields }
    }
}).then(res => res.updateUser)

export default {
    list: listUsers,
    create: createUser,
    delete: deleteUser,
    update: updateUser
}

export const createUsers = (mutationFn: typeof mutation, createListFn: typeof createList) => ({
    list: (fields: QueryUserFieldsUserFields = defaultUserFields) =>
        createListFn("Users", fields).dataPath("app.listUser").fetch(),
    create: (fields: CreateUserFields) => mutationFn({
        addUser: { __args: fields }
    }).then(res => res.addUser),
    delete: (id: Number): Promise<boolean> => mutationFn({
        deleteUser: { __args: { id } }
    }).then(res => res.deleteUser),
    update: (id: number, fields: Partial<CreateUserFields>) => mutationFn({
        updateUser: { __args: { id, data: fields } }
    }).then(res => res.updateUser),
})
