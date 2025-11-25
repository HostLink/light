import { AxiosInstance } from "axios";
import mutation from "./mutation";
export default (axios: AxiosInstance) => {
    return {
        send: (email: string, subject: string, message: string) =>
            mutation({ sendMail: { __args: { email, subject, message } } })
                .then(res => res.sendMail)

    }
}
