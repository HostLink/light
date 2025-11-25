import { mutation, query } from "."
import * as WebAuthn from "./webauthn"

export const login = (username: string, password: string, code: string = ""): Promise<boolean> => {
    return mutation({ login: { __args: { username, password, code } } }).then(res => res.login)
}
export const logout = (): Promise<boolean> => {
    return mutation({ logout: true }).then(res => res.logout)
}
export const changeExpiredPassword = (username: string, oldPassword: string, newPassword: string): Promise<boolean> => {
    return mutation({ changeExpiredPassword: { __args: { username, old_password: oldPassword, new_password: newPassword } } }).then(res => res.changeExpiredPassword)
}
export const updatePassword = (oldPassword: string, newPassword: string): Promise<boolean> => {
    return mutation({ changeUserPassword: { __args: { old_password: oldPassword, new_password: newPassword } } }).then(res => res.changeUserPassword)
}

export const resetPassword = (jwt: string, password: string, code: string): Promise<boolean> => {
    return mutation({ resetPassword: { __args: { jwt, password, code } } }).then(res => res.resetPassword)
}

export const forgetPassword = (username: string, email: string): Promise<string> => {
    return mutation({ forgetPassword: { __args: { username, email } } }).then(res => res.forgetPassword)
}
export const verifyCode = (jwt: string, code: string): Promise<boolean> => {
    return mutation({ forgetPasswordVerifyCode: { __args: { jwt, code } } }).then(res => res.forgetPasswordVerifyCode)
}

export const granted = (rights: string[]): Promise<string[]> => {
    return query({
        my: {
            grantedRights: {
                __args: {
                    rights: rights
                },
            }
        }
    }).then(resp => resp.my.grantedRights)
}

export default () => {
    return {
        WebAuthn,
        google: {
            unlink: (): Promise<boolean> =>
                mutation({ lightAuthUnlinkGoogle: true })
                    .then(res => res.lightAuthUnlinkGoogle),
            login: (credential: string): Promise<boolean> =>
                mutation({ lightAuthLoginGoogle: { __args: { credential } } })
                    .then(res => res.lightAuthLoginGoogle),
            register: (credential: string): Promise<boolean> =>
                mutation({ lightAuthRegisterGoogle: { __args: { credential } } })
                    .then(res => res.lightAuthRegisterGoogle)
        },
        facebook: {
            unlink: (): Promise<boolean> =>
                mutation({ lightAuthUnlinkFacebook: true })
                    .then(res => res.lightAuthUnlinkFacebook),
            login: (accessToken: string): Promise<boolean> =>
                mutation({ lightAuthLoginFacebook: { __args: { access_token: accessToken } } })
                    .then(res => res.lightAuthLoginFacebook),
            register: (accessToken: string): Promise<boolean> =>
                mutation({ lightAuthRegisterFacebook: { __args: { access_token: accessToken } } })
                    .then(res => res.lightAuthRegisterFacebook),
        },
        microsoft: {
            unlink: (): Promise<boolean> =>
                mutation({ lightAuthUnlinkMicrosoft: true }).then(res => res.lightAuthUnlinkMicrosoft),
            login: (accessToken: string): Promise<boolean> =>
                mutation({ lightAuthLoginMicrosoft: { __args: { access_token: accessToken } } }).then(res => res.lightAuthLoginMicrosoft),
            register: (account_id: string): Promise<boolean> =>
                mutation({ lightAuthRegisterMicrosoft: { __args: { account_id } } }).then(res => res.lightAuthRegisterMicrosoft)
        },
        login,
        logout,
        changeExpiredPassword,
        updatePassword,
        resetPassword,
        forgetPassword,
        verifyCode,
        granted


    }
}

