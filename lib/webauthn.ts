import { AxiosInstance } from "axios"
import { mutation } from "."
import useWebAuthn from "./useWebAuthn"

export default (axios: AxiosInstance) => {
    const { assertion, attestation } = useWebAuthn(axios);

    return {
        login: async () => {
            const credential = await assertion();
            await mutation(axios, "webAuthnAssertion", {
                assertion: credential.toJSON()
            })
        },
        register: async () => {
            const credential = await attestation();
            await mutation(axios, "webAuthnRegister", {
                registration: credential.toJSON()
            })
        }
    }
}