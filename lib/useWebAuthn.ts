import { AxiosInstance } from "axios"
import { query } from "."

export default (axios: AxiosInstance) => {

    const assertion = async () => {
        // Implementation for creating an assertion
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

        return credential
    }

    const attestation = async () => {
        // Implementation for creating an attestation
        const { app } = await query(axios, {
            app: {
                auth: {
                    webAuthnCreationOptions: true
                }
            }
        });

        const publicKey = PublicKeyCredential.parseCreationOptionsFromJSON(app.auth.webAuthnCreationOptions);
        const credential = (await navigator.credentials.create({ publicKey })) as PublicKeyCredential;

        return credential
    }

    return {
        assertion,
        attestation
    };


}