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

export const createRole = (name: string, childs: string[]): Promise<boolean> => {
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
}

export const deleteRole = (name: string): Promise<boolean> => {
    return mutation({
        deleteRole: {
            __args: { name }
        }
    }).then(resp => resp.deleteRole);
}



export default () => {
    return {
        list: listRoles,
        create: createRole,
        delete: deleteRole
    }
}

