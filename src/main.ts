import { createClient } from "../lib/index.ts"
const client = createClient("http://127.0.0.1:8888/");

console.log(await client.auth.login("admin", "111111"));


await client.list("User", { first_name: true, last_name: true })
    .where("user_id", 1)
    .fetch().then(console.log);

