import mutation from "./mutation";

export default async (): Promise<boolean> => {
    return await mutation("logout")
}