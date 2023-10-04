import login from "../lib/login"
import logout from "../lib/logout"
import query from "../lib/query"

await logout();

await login("admin", "111111")

console.log(await query({
    my: ["name"]
}));




