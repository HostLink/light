import { query } from "."
export const getUsers = async () => {
    const data = await query({
        listUser: {
            data: {
                username: true,
                first_name: true,
                last_name: true,
            }

        }
    });
    return data.listUser.data;
};
