import { AxiosInstance } from "axios";
import mutation from "./mutation";
export default (axios: AxiosInstance) => {
    return {
        send: (email: string, subject: string, message: string) => {
            return mutation(axios, "sendMail", {
                email,
                subject,
                message
            })
        }
    }
}
