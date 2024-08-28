import { AxiosInstance } from "axios"
import { query, mutation } from "."
import { parseRequestOptionsFromJSON, get, parseCreationOptionsFromJSON, create } from "@github/webauthn-json/browser-ponyfill"

export default (axios: AxiosInstance) => {
    return {
        login: async (username: string) => {
            const json = await query(axios, {
                webAuthnRequestOptions: {
                    __args: {
                        username
                    }
                }
            })

            const options = json.webAuthnRequestOptions;


            const requestOptions = parseRequestOptionsFromJSON({
                publicKey: options
            });

            const response = await get(requestOptions);

            await mutation(axios, "webAuthnAssertion", {
                username,
                assertion: response.toJSON()
            })
        },
        register: async () => {
            const json = await query(axios, { webAuthnCreationOptions: true });

            const options = parseCreationOptionsFromJSON({
                publicKey: json.webAuthnCreationOptions
            });

            const response = await create(options);

            await mutation(axios, "webAuthnRegister", {
                registration: response.toJSON()
            })

        }
    }
}