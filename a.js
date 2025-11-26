import { createClient, login, getDrive, listPermissions, getCurrentUser } from "./src"
createClient("http://localhost:8888/")
await login("admin", "111111")

//const { listFolders } = getDrive(0)


console.log(await getCurrentUser())


