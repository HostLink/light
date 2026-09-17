import { mutation, query } from "."
export const createWebAuthn = (queryFn: typeof query, mutationFn: typeof mutation) => {
const assertion = async () => {
    // Implementation for creating an assertion
    const { app } = await queryFn({
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
    const { app } = await queryFn({
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

const login = async () => {
    const credential = await assertion();
    return await mutationFn({
        webAuthnAssertion: {
            __args: {
                assertion: credential.toJSON()
            }
        }
    }).then(res => res.webAuthnAssertion);
}

const register = async () => {
    const credential = await attestation();
    return await mutationFn({
        webAuthnRegister: {
            __args: {
                registration: credential.toJSON()
            }
        }
    }).then(res => res.webAuthnRegister);
}

return { assertion, attestation, login, register };
}

const defaultWebAuthn = createWebAuthn(query, mutation);
export const assertion = defaultWebAuthn.assertion;
export const attestation = defaultWebAuthn.attestation;
export const login = defaultWebAuthn.login;
export const register = defaultWebAuthn.register;
