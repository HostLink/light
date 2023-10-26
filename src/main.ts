import { login, logout } from "../lib/auth"
import query from "../lib/query"
import uploadFile from "../lib/uploadFile"
import sendMail from "../lib/sendMail"
import getConfig from "../lib/getConfig"

import webauthnRegister from "../lib/webauthnRegister"
import webauthnLogin from "../lib/webauthnLogin"
import toQuery from "../lib/toQuery"


import { defineModel, getGQLFields, getModelField } from "../lib/Model"

defineModel("Invoice", {
    invoice_no: {
        label: 'Invoice No',
    }
})

defineModel("InvoiceItem", {
    item_name: {
        label: 'Item Name',
    },
    quantity: {
        label: 'Quantity',
    },
    unit_price: {
        label: 'Unit Price',
    }
})


console.log(getGQLFields("Invoice", ["invoice_no",
    {
        invoice_items: getGQLFields('InvoiceItem', ["item_name", "quantity", "unit_price"])
    }
]))

console.log(getModelField("Invoice", "invoice_no")?.getFormattedValue({ invoice_no: "123" }))


const qq = toQuery([{
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

await logout();

await login("admin", "111111")


document.getElementById("webauthn_register")?.addEventListener("click", async () => {
    //download creation credential options
    console.log(await webauthnRegister());
});


document.getElementById("webauthn_login")?.addEventListener("click", async () => {
    webauthnLogin("admin");
});



console.log(await getConfig("company"));

console.log(await query({
    my: ["name"]
}));


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
