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


export const useUsers = () => {
    let isLoading = false
    let error: string | null = null
    let users: Array<any> = []

    const fetchUsers = async (fields: UserFields = {
        user_id: true,
        username: true,
        first_name: true,
        last_name: true,
        status: true
    }) => {
        isLoading = true
        error = null
        try {
            users = await createList("Users", fields).dataPath("app.users").fetch()
        } catch (err: any) {
            error = err.message
        } finally {
            isLoading = false
        }
    }



    return {
        users,
        fetchUsers,
        isLoading,
        error,
        list: (fields: UserFields = {
            user_id: true,
            username: true,
            first_name: true,
            last_name: true,
            status: true
        }) => {
            return createList("Users", fields).dataPath("app.users");
        },
        create: (fields: UserFields) => createUser(fields),
        delete: (id: Number): Promise<boolean> => deleteUser(id)

    }
}

export default useUsers;