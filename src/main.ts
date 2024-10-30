import collect from "collect.js";
import { createClient } from "../lib/index.ts"
import mail from "../lib/mail.ts";
const client = createClient("http://127.0.0.1:8888/");

const resp = await client.axios.post("/", {
    query: `mutation { login(username: "admin", password: "111111")  }`
})

if (resp.headers['set-cookie']) {
    client.axios.defaults.headers.cookie = resp.headers['set-cookie'][0];
}

console.log(await client.collect("MailLog")
    .forPage(2, 10)

    .all({ maillog_id: true })
);


/* 

import { login, logout } from "../lib/auth"


import query from "../lib/query"
import uploadFile from "../lib/uploadFile"
import sendMail from "../lib/sendMail"
import getConfig from "../lib/getConfig"

import webauthnRegister from "../lib/webauthnRegister"
import webauthnLogin from "../lib/webauthnLogin"
import toQuery from "../lib/toQuery"
import { model } from "../lib/model"


import { mutation, getRoles, getUsers } from "../lib"

console.log(await login("admin", "111111"))
console.log(await getRoles());

console.log(await getUsers());
 */

/* import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';

const query = {
    query: {
        __variables: {
            variable1: 'String!',
            variableWithDefault: 'String = "default_value"'
        },
        Posts: {
            __args: {
                arg1: 20,
                arg2: new VariableType('variable1')
            },
            id: true,
            title: true
        }
    }
};
const graphql_query = jsonToGraphQLQuery(query, { pretty: true });

console.log(graphql_query);
 */


/* const qq = toQuery([{
    listUpdates: {
        __args: {
            filters: {
                type: 1
            },
        },
        x: [{
            __args: {
                ay: 1
            },
        }, "z", "dd"],
        b: false,
    },
}, "abc"]);
console.log(qq);
 */
//await logout();
/* 
console.log(await login("admin", "111111"))

//list Roles



document.getElementById("webauthn_register")?.addEventListener("click", async () => {
    //download creation credential options
    console.log(await webauthnRegister());
});


document.getElementById("webauthn_login")?.addEventListener("click", async () => {
    webauthnLogin("admin");
});
 */


//console.log(await getConfig("company"));

/* console.log(await query({
    my: ["name"]
}));
 */

document.getElementById("sendMail")?.addEventListener("click", async () => {
    console.log(await sendMail("raymond@hostlink.com.hk", "Testing", "Testing"));
});

document.getElementById("upload")?.addEventListener("click", async () => {
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

document.getElementById("upload2")?.addEventListener("click", async () => {
    console.log("upload2");

    const fileInput = document.getElementById("file2") as HTMLInputElement | null;
    if (!fileInput) {
        console.error("File2 input not found");
        return;
    }

    const file = fileInput.files?.[0];
    if (!file) {
        console.error("No file selected");
        return;
    }

    /*  await model("Test").add({
         a: 1,
         file: file
     }) */

    await model("Test").update(1, {
        a: 1,
        file: file
    })
});


document.getElementById("f_download")?.addEventListener("click", async () => {
    File.fromString("Hello").download("test.txt");

});

document.getElementById("f_open")?.addEventListener("click", async () => {
    //  console.log("open")
    //    File.fromBase64("SGVsbG8=").open("text/plain");

    File.fromBase85("9jqo^BlbD-").open("text/plain");
});





//console.log(await model("User").get({ user_id: 1 }, ["username"]));

