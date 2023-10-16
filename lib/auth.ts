import { mutation } from "."

export const login = (username: string, password: string, code: string = ""): Promise<boolean> => {
    return mutation("login", {
        username,
        password,
        code
    })
}

export const logout = (): Promise<boolean> => {
    return mutation("logout")
}

/**
 * Updates the user's password.
 * @param oldPassword The user's current password.
 * @param newPassword The user's new password.
 * @returns A Promise that resolves to a boolean indicating whether the password was successfully updated.
 */
export const updatePassword = (oldPassword: string, newPassword: string): Promise<boolean> => {
    return mutation("updatePassword", {
        old_password: oldPassword,
        new_password: newPassword
    })
}


export const resetPassword = (email: string, password: string, code: string): Promise<boolean> => {
    return mutation("resetPassword", {
        email,
        password,
        code
    })
}

export const forgetPassword = (email: string): Promise<boolean> => {
    return mutation("forgetPassword", {
        email
    })
}
