import { createClient } from "../lib/index.ts"
const api = createClient("http://127.0.0.1:8888/");

const resp = await api.axios.post("/", {
    query: `mutation { login(username: "admin", password: "111111")  }`
})

if (resp.headers['set-cookie']) {
    api.axios.defaults.headers.cookie = resp.headers['set-cookie'][0];
}

console.log(await api.roles.list({
    name: true,
    user: {
        username: true,
    }
}));

/*


client.model("MailLog").setDataPath("app.mailLogs")

let c = client.collect("MailLog", { maillog_id: true, subject: true })
let d = c.sortByDesc("maillog_id")
    .where("maillog_id", "<", 100)
    .take(100)
    .sortBy("maillog_id")
    .whereContains("subject", "GET")

const data = await d.all();
const meta = d.meta.total
 */
//document.getElementById("content").innerHTML = JSON.stringify(data, null, 4);