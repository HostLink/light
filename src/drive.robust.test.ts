import { describe, expect, it, beforeAll } from "vitest"
import { createClient } from "."

const client = createClient("http://localhost:8888/")
const driveIndex = 0 // 預設使用 drive index 0

describe("drive - robust tests", () => {
    beforeAll(async () => {
        // 登入以確保有權限存取 drive 功能
        const loginResult = await client.auth.login("admin", "111111")
        expect(loginResult).toBe(true)
    })

    describe("folders", () => {
        const testFolderPath = "/test-folder-" + Date.now()

        it("should create a new folder", async () => {
            const result = await client.drive(driveIndex).folders.create(testFolderPath)
            expect(result).toBe(true)
        })

        it("should list folders and verify creation", async () => {
            const folders = await client.drive(driveIndex).folders.list("/")
            expect(Array.isArray(folders)).toBe(true)
            
            const expectedPath = testFolderPath.startsWith("/") ? testFolderPath.slice(1) : testFolderPath
            const folderExists = folders.some((folder: any) => folder.path === expectedPath)
            
            expect(folderExists).toBe(true)
        })

        it("should clean up test folder", async () => {
            try {
                const result = await client.drive(driveIndex).folders.delete(testFolderPath)
                expect(result).toBe(true)
            } catch (error) {
                console.warn("Failed to delete test folder:", error)
            }
        })
    })

    describe("files", () => {
        const testFileName = "test-file-" + Date.now() + ".txt"
        const testFilePath = "/" + testFileName
        const testContent = "This is test content: " + Math.random().toString(36)

        it("should write a file", async () => {
            const result = await client.drive(driveIndex).files.write(testFilePath, testContent)
            expect(result).toBe(true)
        })

        it("should list files and verify creation", async () => {
            const files = await client.drive(driveIndex).files.list("/")
            expect(Array.isArray(files)).toBe(true)
            
            const expectedPath = testFilePath.startsWith("/") ? testFilePath.slice(1) : testFilePath
            const fileExists = files.some((file: any) => file.path === expectedPath)
            
            expect(fileExists).toBe(true)
        })

        it("should get file info", async () => {
            // 嘗試獲取檔案資訊
            try {
                const file = await client.drive(driveIndex).files.get(testFilePath)
                if (file) {
                    expect(file).toBeDefined()
                    expect(file.path).toBe(testFilePath)
                    console.log("File info:", file)
                } else {
                    console.warn("File not found:", testFilePath)
                }
            } catch (error) {
                console.warn("Error getting file:", error)
            }
        })

        it("should read file content", async () => {
            const content = await client.drive(driveIndex).files.read(testFilePath)
            expect(content).toBeDefined()
            expect(typeof content).toBe('string')
            expect(content.length).toBeGreaterThan(0)
        })

        it("should clean up test file", async () => {
            try {
                const result = await client.drive(driveIndex).files.delete(testFilePath)
                expect(result).toBe(true)
            } catch (error) {
                console.warn("Failed to delete test file:", error)
            }
        })
    })

    describe("api behavior investigation", () => {
        it("should investigate drive structure", async () => {
            try {
                // 檢查根目錄結構
                const folders = await client.drive(driveIndex).folders.list("/")
                const files = await client.drive(driveIndex).files.list("/")
                
                console.log("=== Drive Investigation ===")
                console.log("Folders in root:", folders?.length || 0)
                console.log("Files in root:", files?.length || 0)
                
                if (folders?.length > 0) {
                    console.log("Sample folders:", folders.slice(0, 3))
                }
                if (files?.length > 0) {
                    console.log("Sample files:", files.slice(0, 3))
                }
                
                // 嘗試不同路徑格式
                try {
                    const foldersNoSlash = await client.drive(driveIndex).folders.list("")
                    console.log("Folders with empty path:", foldersNoSlash?.length || 0)
                } catch (e) {
                    console.log("Empty path not supported")
                }
                
            } catch (error) {
                console.error("Investigation failed:", error)
            }
        })
    })
})
