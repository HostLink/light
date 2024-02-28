import { query } from "."
export const getRoles = async () => {
    const data = await query({
        listRole: {
            name: true,
        }
    });
    return data.listRole;
};
