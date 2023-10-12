import query from "./query"
import mutation from "./mutation";
import { parseCreationOptionsFromJSON, create } from "@github/webauthn-json/browser-ponyfill"


export default async function () {
    const json = await query({ webAuthnCreationOptions: true });

    const options = parseCreationOptionsFromJSON({
        publicKey: json.webAuthnCreationOptions
    });

    const response = await create(options);

    await mutation("webAuthnRegister", {
        registration: response.toJSON()
    })

}


