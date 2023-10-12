import mutation from "./mutation";

export default (email: string, subject: string, message: string) => {
    return mutation("sendMail", { email, subject, message })

}