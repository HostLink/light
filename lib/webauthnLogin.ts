import query from "./query"
import mutation from "./mutation";
import { parseRequestOptionsFromJSON, get } from "@github/webauthn-json/browser-ponyfill"
export default async function (username: string) {

    const json = await query({
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

    await mutation("webAuthnAssertion", {
        username,
        assertion: response.toJSON()
    })




}