import { mutation, query } from "."
import { AxiosInstance } from "axios"
import { default as WebAuthn } from "./webauthn"

export default (axios: AxiosInstance) => {
    return {
        WebAuthn: WebAuthn(axios),
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
        resetPassword: (email: string, password: string, code: string): Promise<boolean> => {
            return mutation(axios, "resetPassword", {
                email,
                password,
                code
            })
        },
        forgetPassword: (email: string): Promise<boolean> => {
            return mutation(axios, "forgetPassword", {
                email
            })
        },
        verifyCode(email: string, code: string): Promise<boolean> {
            return mutation(axios, "verifyCode", {
                email,
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
