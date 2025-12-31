import { createClient, login, getDrive, listPermissions, getCurrentUser, webAuthn, auth, defineModel, getModel, list } from "./src"
const client = createClient("http://localhost:8888/")
console.log(await login("admin", "111111"));

await client.query({
    my: {
        username: true
    }
}).then(console.log)


//sleep 5 seconds
await new Promise(resolve => setTimeout(resolve, 2000));

await client.query({
    my: {
        username: true
    }
}).then(console.log)

