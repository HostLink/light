import { AxiosInstance } from "axios";
import { query } from "."
import { UserFields } from "./useUser";


export type RoleFields = {
    name?: boolean;
    canDelete?: boolean;
    canUpdate?: boolean;
    children?: boolean;
    user?: UserFields
}

const useRole = (axios: AxiosInstance) => {
    return {
        list: (fields: RoleFields = {
            name: true,
        }) => {
            return query(axios, {
                app: {
                    roles: fields
                }
            }).then(resp => resp.app.roles) as Promise<Array<typeof fields>>;
        },

        create: (name: string, childs: string[]): Promise<boolean> => {
            return query(axios, {
                app: {
                    createRole: {
                        __args: { name, childs }
                    }
                }
            }).then(resp => resp.app.createRole);
        },

        delete: (name: string): Promise<boolean> => {
            return query(axios, {
                app: {
                    deleteRole: {
                        __args: { name }
                    }
                }
            }).then(resp => resp.app.deleteRole);
        }



    }
}

export default useRole;