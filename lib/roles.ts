import { query } from "."
import type { UserFields } from "./users"

export type RoleFields = {
    name?: boolean;
    canDelete?: boolean;
    canUpdate?: boolean;
    children?: boolean;
    user?: UserFields
}

export default () => {
    return {
        list: (fields: RoleFields = {
            name: true,
        }) => {
            return query({
                app: {
                    roles: fields
                }
            }).then(resp => resp.app.roles) as Promise<Array<typeof fields>>;
        },

        create: (name: string, childs: string[]): Promise<boolean> => {
            return query({
                app: {
                    createRole: {
                        __args: { name, childs }
                    }
                }
            }).then(resp => resp.app.createRole);
        },

        delete: (name: string): Promise<boolean> => {
            return query({
                app: {
                    deleteRole: {
                        __args: { name }
                    }
                }
            }).then(resp => resp.app.deleteRole);
        }



    }
}

