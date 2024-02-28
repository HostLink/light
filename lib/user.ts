import { query } from "."
export const getUsers = async () => {
    const data = await query({
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
};
