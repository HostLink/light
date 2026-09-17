import mutation from "./mutation";

export const sendMail = (email: string, subject: string, message: string) => {
    return mutation({ sendMail: { __args: { email, subject, message } } })
        .then(res => res.sendMail)
}

export const createMail = (mutationFn: typeof mutation) => ({
    send: (email: string, subject: string, message: string) =>
        mutationFn({ sendMail: { __args: { email, subject, message } } })
            .then(res => res.sendMail)
})

export default {
    send: sendMail
}
