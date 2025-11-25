import { mutation, query } from "."
export const assertion = async () => {
    // Implementation for creating an assertion
    const { app } = await query({
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

export const attestation = async () => {
    // Implementation for creating an attestation
    const { app } = await query({
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

export const login = async () => {
    const credential = await assertion();
    return await mutation({
        webAuthnAssertion: {
            assertion: credential.toJSON()
        }
    }).then(res => res.webAuthnAssertion);
}

export const register = async () => {
    const credential = await attestation();
    return await mutation({
        webAuthnRegister: {
            registration: credential.toJSON()
        }
    }).then(res => res.webAuthnRegister);
}