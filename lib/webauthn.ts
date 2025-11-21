import { AxiosInstance } from "axios"
import { mutation } from "."
import useWebAuthn from "./useWebAuthn"

export default (axios: AxiosInstance) => {
    const { assertion, attestation } = useWebAuthn(axios);

    return {
        login: async () => {
            const credential = await assertion();
            return await mutation(axios, {
                webAuthnAssertion: {
                    assertion: credential.toJSON()
                }
            }).then(res => res.webAuthnAssertion);
        },
        register: async () => {
            const credential = await attestation();
            return await mutation(axios, {
                webAuthnRegister: {
                    registration: credential.toJSON()
                }
            }).then(res => res.webAuthnRegister);
        }
    }
}