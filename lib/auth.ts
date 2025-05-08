import { mutation, query } from "."
import { AxiosInstance } from "axios"
import { default as WebAuthn } from "./webauthn"

export default (axios: AxiosInstance) => {
    return {
        WebAuthn: WebAuthn(axios),
        google: {
            unlink: (): Promise<boolean> => {
                return mutation(axios, "lightAuthUnlinkGoogle")
            },
            login: (credential: string): Promise<boolean> => {
                return mutation(axios, "lightAuthLoginGoogle", {
                    credential
                })
            },
            register: (credential: string): Promise<boolean> => {
                return mutation(axios, "lightAuthRegisterGoogle", {
                    credential
                })
            }
        },
        facebook: {
            unlink: (): Promise<boolean> => {
                return mutation(axios, "lightAuthUnlinkFacebook")
            },
            login: (accessToken: string): Promise<boolean> => {
                return mutation(axios, "lightAuthLoginFacebook", {
                    access_token: accessToken
                })
            },
            register: (accessToken: string): Promise<boolean> => {
                return mutation(axios, "lightAuthRegisterFacebook", {
                    access_token: accessToken
                })
            }
        },
        microsoft: {
            unlink: (): Promise<boolean> => {
                return mutation(axios, "lightAuthUnlinkMicrosoft")
            },
            login: (accessToken: string): Promise<boolean> => {
                return mutation(axios, "lightAuthLoginMicrosoft", {
                    access_token: accessToken
                })
            },
            register: (account_id: string): Promise<boolean> => {
                return mutation(axios, "lightAuthRegisterMicrosoft", {
                    account_id
                })
            }
        },
        login: (username: string, password: string, code: string = ""): Promise<boolean> => {
            return mutation(axios, "login", {
                username,
                password,
                code
            })
        },
        logout: (): Promise<boolean> => {
            return mutation(axios, "logout")
        },
        changeExpiredPassword: (username: string, oldPassword: string, newPassword: string): Promise<boolean> => {
            return mutation(axios, "changeExpiredPassword", {
                username,
                old_password: oldPassword,
                new_password: newPassword
            })
        },
        updatePassword: (oldPassword: string, newPassword: string): Promise<boolean> => {
            return mutation(axios, "changeUserPassword", {
                old_password: oldPassword,
                new_password: newPassword
            })
        },
        resetPassword: (jwt: string, password: string, code: string): Promise<boolean> => {
            return mutation(axios, "resetPassword", {
                jwt,
                password,
                code
            })
        },
        forgetPassword: (username: string, email: string): Promise<string> => {
            return mutation(axios, "forgetPassword", {
                username,
                email
            })
        },
        verifyCode(jwt: string, code: string): Promise<boolean> {
            return mutation(axios, "forgetPasswordVerifyCode", {
                jwt,
                code
            })
        },
        granted: async (rights: string[]): Promise<string[]> => {
            const resp = await query(axios, {
                granted: {
                    __args: {
                        rights: rights
                    },
                }
            });

            return resp.granted;
        }
    }

}
