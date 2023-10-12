import login from "../lib/login"
import logout from "../lib/logout"
import query from "../lib/query"
import uploadFile from "../lib/uploadFile"
import sendMail from "../lib/sendMail"

await logout();

await login("admin", "111111")

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
