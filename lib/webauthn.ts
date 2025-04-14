import { AxiosInstance } from "axios"
import { query, mutation } from "."
import { parseRequestOptionsFromJSON, get, parseCreationOptionsFromJSON, create } from "@github/webauthn-json/browser-ponyfill"

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

            const requestOptions = parseRequestOptionsFromJSON({
                publicKey: options
            });

            const response = await get(requestOptions);

            await mutation(axios, "webAuthnAssertion", {
                assertion: response.toJSON()
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

            const options = parseCreationOptionsFromJSON({
                publicKey: app.auth.webAuthnCreationOptions
            });

            const response = await create(options);

            await mutation(axios, "webAuthnRegister", {
                registration: response.toJSON()
            })

        }
    }
}