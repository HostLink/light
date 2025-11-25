import { mutation, query } from "."
import type { UserFields } from "./users"

export type RoleFields = {
    name?: string;
    canDelete?: boolean;
    canUpdate?: boolean;
    children?: boolean;
    user?: UserFields
}


export type QueryRoleFields = Partial<Record<keyof RoleFields, boolean>>

const defaultRoleFields: QueryRoleFields = {
    name: true,
}

export const listRoles = (fields: QueryRoleFields = defaultRoleFields) => {
    return query({
        app: {
            roles: fields
        }
    }).then(resp => resp.app.roles) as Promise<Array<RoleFields>>;
}

export default () => {
    return {
        list: listRoles,

        create: (name: string, childs: string[]): Promise<boolean> => {
            return mutation({
                addRole: {
                    __args: {
                        data: {
                            name,
                            childs
                        }
                    }
                }
            }).then(resp => resp.addRole);
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

