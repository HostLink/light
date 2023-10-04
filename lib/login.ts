import mutation from "./mutation";

export default async (username: string, password: string, code: string = ""): Promise<boolean> => {
    return await mutation("login", {
        username,
        password,
        code
    })
}