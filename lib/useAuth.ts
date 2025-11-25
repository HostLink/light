import { mutation, query } from "."
import { AxiosInstance } from "axios"
import { default as WebAuthn } from "./webauthn"


export const useAuth = (axios: AxiosInstance) => {
    return {
        WebAuthn: WebAuthn(axios),
        google: {
            unlink: (): Promise<boolean> =>
                mutation(axios, { lightAuthUnlinkGoogle: true })
                    .then(res => res.lightAuthUnlinkGoogle),
            login: (credential: string): Promise<boolean> =>
                mutation(axios, { lightAuthLoginGoogle: { __args: { credential } } })
                    .then(res => res.lightAuthLoginGoogle),
            register: (credential: string): Promise<boolean> =>
                mutation(axios, { lightAuthRegisterGoogle: { __args: { credential } } })
                    .then(res => res.lightAuthRegisterGoogle)
        },
        facebook: {
            unlink: (): Promise<boolean> =>
                mutation(axios, { lightAuthUnlinkFacebook: true })
                    .then(res => res.lightAuthUnlinkFacebook),
            login: (accessToken: string): Promise<boolean> =>
                mutation(axios, { lightAuthLoginFacebook: { __args: { access_token: accessToken } } })
                    .then(res => res.lightAuthLoginFacebook),
            register: (accessToken: string): Promise<boolean> =>
                mutation(axios, { lightAuthRegisterFacebook: { __args: { access_token: accessToken } } })
                    .then(res => res.lightAuthRegisterFacebook),
        },
        microsoft: {
            unlink: (): Promise<boolean> =>
                mutation(axios, { lightAuthUnlinkMicrosoft: true }).then(res => res.lightAuthUnlinkMicrosoft),
            login: (accessToken: string): Promise<boolean> =>
                mutation(axios, { lightAuthLoginMicrosoft: { __args: { access_token: accessToken } } }).then(res => res.lightAuthLoginMicrosoft),
            register: (account_id: string): Promise<boolean> =>
                mutation(axios, { lightAuthRegisterMicrosoft: { __args: { account_id } } }).then(res => res.lightAuthRegisterMicrosoft)
        },
        login: (username: string, password: string, code: string = ""): Promise<boolean> => {
            return mutation(axios, { login: { __args: { username, password, code } } }).then(res => res.login)
        },
        logout: (): Promise<boolean> => {
            return mutation(axios, { logout: true }).then(res => res.logout)
        },
        changeExpiredPassword: (username: string, oldPassword: string, newPassword: string): Promise<boolean> => {
            return mutation(axios, { changeExpiredPassword: { __args: { username, old_password: oldPassword, new_password: newPassword } } }).then(res => res.changeExpiredPassword)
        },
        updatePassword: (oldPassword: string, newPassword: string): Promise<boolean> => {
            return mutation(axios, { changeUserPassword: { __args: { old_password: oldPassword, new_password: newPassword } } }).then(res => res.changeUserPassword)
        },
        resetPassword: (jwt: string, password: string, code: string): Promise<boolean> => {
            return mutation(axios, { resetPassword: { __args: { jwt, password, code } } }).then(res => res.resetPassword)
        },
        forgetPassword: (username: string, email: string): Promise<string> => {
            return mutation(axios, { forgetPassword: { __args: { username, email } } }).then(res => res.forgetPassword)
        },
        verifyCode(jwt: string, code: string): Promise<boolean> {
            return mutation(axios, { forgetPasswordVerifyCode: { __args: { jwt, code } } }).then(res => res.forgetPasswordVerifyCode)
        },
        granted: (rights: string[]): Promise<string[]> => {
            return query(axios, {
                my: {
                    grantedRights: {
                        __args: {
                            rights: rights
                        },
                    }
                }
            }).then(resp => resp.my.grantedRights)
        }
    }
}

export default useAuth
