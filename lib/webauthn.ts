import { AxiosInstance } from "axios"
import { query, mutation } from "."

export default (axios: AxiosInstance) => {
    return {
        login: async () => {
            const { app } = await query(axios, {
                app: {
                    auth: {
                        webAuthnRequestOptions: true
                    }
                }
            })

            const options = app.auth.webAuthnRequestOptions;

            const publicKey = PublicKeyCredential.parseRequestOptionsFromJSON(options);
            const credential = (await navigator.credentials.get({ publicKey })) as PublicKeyCredential;
            await mutation(axios, "webAuthnAssertion", {
                assertion: credential.toJSON()
            })
        },
        register: async () => {
            const { app } = await query(axios, {
                app: {
                    auth: {
                        webAuthnCreationOptions: true
                    }
                }
            });

            const publicKey = PublicKeyCredential.parseCreationOptionsFromJSON(app.auth.webAuthnCreationOptions);
            const credential = (await navigator.credentials.create({ publicKey })) as PublicKeyCredential;

            await mutation(axios, "webAuthnRegister", {
                registration: credential.toJSON()
            })

        }
    }
}