import { mutation, query } from "."
import { AxiosInstance } from "axios"
import { default as WebAuthn } from "./webauthn"

export default (axios: AxiosInstance) => {
    return {
        WebAuthn: WebAuthn(axios),
        facebookLogin: (accessToken: string): Promise<boolean> => {
            return mutation(axios, "facebookLogin", {
                access_token: accessToken
            })
        },
        microsoftLogin: (accessToken: string): Promise<boolean> => {
            return mutation(axios, "microsoftLogin", {
                access_token: accessToken
            })
        },
        googleLogin: (credential: string): Promise<boolean> => {
            return mutation(axios, "googleLogin", {
                credential
            })
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
        updatePassword: (oldPassword: string, newPassword: string): Promise<boolean> => {
            return mutation(axios, "updatePassword", {
                old_password: oldPassword,
                new_password: newPassword
            })
        },
        resetPassword: (username: string, password: string, code: string): Promise<boolean> => {
            return mutation(axios, "resetPassword", {
                username,
                password,
                code
            })
        },
        forgetPassword: (username: string, email: string): Promise<boolean> => {
            return mutation(axios, "forgetPassword", {
                username,
                email
            })
        },
        verifyCode(username: string, code: string): Promise<boolean> {
            return mutation(axios, "forgetPasswordVerifyCode", {
                username,
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
