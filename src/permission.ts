import { query } from '.';
export const listPermissions = (): Promise<Array<string>> => {
    return query({
        app: {
            permissions: true
        }
    }).then(resp => resp.app.permissions)
}

export default () => {
    return {
        list: listPermissions,
    }
}
