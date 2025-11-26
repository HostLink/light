import { createClient } from "./src/index.ts"

const client = createClient("http://localhost:8888/")
const driveIndex = 0 // 預設使用 drive index 0
if (await client.auth.login("admin", "111111")) {
    console.log("登入成功")
}

const testFileName = "test-file-" + Date.now() + ".txt"
console.log("準備寫入檔案:", testFileName)
const testFilePath = "/" + testFileName
const testContent = "This is test content: " + Math.random().toString(36)
const result = await client.drive(driveIndex).files.write(testFilePath, testContent)

console.log("檔案寫入結果:", result)


const content = await client.drive(driveIndex).files.read(testFilePath)
console.log("讀取檔案內容:", content)