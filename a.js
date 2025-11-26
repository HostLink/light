import { createClient, login, getDrive } from "./src"
createClient("http://localhost:8888/")
await login("admin", "111111")

const { listFiles } = getDrive(0)


console.log(await listFiles("/"))


