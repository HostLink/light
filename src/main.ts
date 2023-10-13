import login from "../lib/login"
import logout from "../lib/logout"
import query from "../lib/query"
import uploadFile from "../lib/uploadFile"
import sendMail from "../lib/sendMail"
import getConfig from "../lib/getConfig"

import webauthnRegister from "../lib/webauthnRegister"
import webauthnLogin from "../lib/webauthnLogin"


import toQuery from "../lib/toQuery"


const qq = toQuery(["a", { b: [{ __args: { a: 1 } }, "c", "d"] }, "e"]);
console.log(qq);

await logout();

await login("admin", "111111")


document.getElementById("webauthn_register").addEventListener("click", async () => {
    //download creation credential options
    console.log(await webauthnRegister());
});


document.getElementById("webauthn_login").addEventListener("click", async () => {
    webauthnLogin("admin");
});



console.log(await getConfig("company"));

console.log(await query({
    my: ["name"]
}));


document.getElementById("sendMail").addEventListener("click", async () => {
    console.log(await sendMail("raymond@hostlink.com.hk", "Testing", "Testing"));
});

document.getElementById("upload").addEventListener("click", async () => {
    //get file
    const fileInput = document.getElementById("file") as HTMLInputElement | null;
    if (!fileInput) {
        console.error("File input not found");
        return;
    }
    const file = fileInput.files?.[0];
    if (!file) {
        console.error("No file selected");
        return;
    }
    //upload file
    const resp = await uploadFile(file);

    console.log(resp)
});
