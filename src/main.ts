import { createClient } from "../lib/index.ts"
const client = createClient("http://127.0.0.1:8888/");

console.log(await client.auth.login("admin", "111111"));

console.log(await client.collect("User", { first_name: true, last_name: true })
    .whereBetween("user_id", [2, 5])
    .all());
