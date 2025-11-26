import { createClient } from "./src/index.ts"

const client = createClient("http://localhost:8888/")
const driveIndex = 0 // 預設使用 drive index 0
if (await client.auth.login("admin", "111111")) {
    console.log("登入成功")
}
await client.drive(driveIndex).files.move("a.txt", "/b");