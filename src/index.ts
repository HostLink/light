import createList from './createList'

export * from './models'

export * from './permission'
export * as webAuthn from "./webauthn"
export * from './auth'
export { default as auth } from './auth'
export * from './drive'
export * from './folder'
export * from './users'
export * from './config'
export * from './role'

export * from './model'
export * from './file'
export * from './mail'
export * from './fileUtils'


export { default as query } from './query'
export { default as mutation } from './mutation'

export { default as toQuery } from './toQuery'

export type Fields = Record<string, any>


export { default as createClient } from './createClient'
export type { LightClient } from './createClient'

export { default as createCollection } from './createCollection'
export { default as createList } from './createList'

export const list = createList

export type { RoleFields } from './role'

export { setApiClient, getApiClient, getApiClientOptional } from './apiClient'

export interface GraphQLQuery {
    [key: string]: boolean | GraphQLQuery | {
        __args: Record<string, any>,
        __aliasFor?: string,
        __variables?: Record<string, string>,
        __name?: string
    };
}