import { AxiosInstance } from "axios";
import { query } from "."
import { UserFields } from "./users";


export type RoleFields = {
    name?: boolean;
    canDelete?: boolean;
    canUpdate?: boolean;
    children?: boolean;
    user?: UserFields
}

export default (axios: AxiosInstance) => {

    return {
        list: async (fields: RoleFields = {
            name: true,
        }) => {
            const { app: { roles } } = await query(axios, {
                app: {
                    roles: fields
                }
            });
            return roles;
        }
    }
}