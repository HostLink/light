import { describe, expect, it, beforeAll, afterEach } from "vitest"
import { createClient } from "."
import { login } from "./auth"
import {
    createFolder,
    deleteFolder,
    renameFolder,
    renameFile,
    writeFile,
    deleteFile,
    move,
    exists,
    list,
    read
} from "./filesystem"

const client = createClient("http://localhost:8888/")

describe("filesystem", () => {
    beforeAll(async () => {
        // 登入以取得必要的權限
        const loginResult = await login("admin", "111111")
        expect(loginResult).toBe(true)
    })

    describe("folder operations", () => {
        const testFolderPath = "local://test-folder"
        const nestedFolderPath = "local://test-folder/nested"

        afterEach(async () => {
            // 清理測試用的資料夾
            try {
                await deleteFolder(testFolderPath)
            } catch (e) {
                // 忽略刪除失敗的錯誤
            }
        })

        it("should create a folder", async () => {
            const result = await createFolder(testFolderPath)
            expect(result).toBeDefined()
            
            const folderExists = await exists(testFolderPath)
            expect(folderExists).toBe(true)
        })

        it("should check if folder exists", async () => {
            await createFolder(testFolderPath)
            const folderExists = await exists(testFolderPath)
            expect(folderExists).toBe(true)
        })

        it("should check if non-existent folder does not exist", async () => {
            const nonExistentPath = "local://non-existent-folder-xyz"
            const folderExists = await exists(nonExistentPath)
            expect(folderExists).toBe(false)
        })

        it("should rename a folder", async () => {
            await createFolder(testFolderPath)
            const newFolderPath = "local://test-folder-renamed"
            
            const result = await renameFolder(testFolderPath, "test-folder-renamed")
            expect(result).toBeDefined()
            
            const oldExists = await exists(testFolderPath)
            const newExists = await exists(newFolderPath)
            expect(oldExists).toBe(false)
            expect(newExists).toBe(true)
            
            // 清理重命名後的資料夾
            await deleteFolder(newFolderPath)
        })

        it("should delete a folder", async () => {
            await createFolder(testFolderPath)
            const beforeDelete = await exists(testFolderPath)
            expect(beforeDelete).toBe(true)
            
            const result = await deleteFolder(testFolderPath)
            expect(result).toBeDefined()
            
            const afterDelete = await exists(testFolderPath)
            expect(afterDelete).toBe(false)
        })

        it("should list folder contents", async () => {
            await createFolder(testFolderPath)
            const result = await list(testFolderPath)
            expect(result).toBeDefined()
            expect(result.children).toBeDefined()
        })
    })

    describe("file operations", () => {
        const testFolderPath = "local://test-file-folder"
        const testFilePath = "local://test-file-folder/test.txt"
        const testContent = "Hello, World!"

        beforeAll(async () => {
            try {
                await createFolder(testFolderPath)
            } catch (e) {
                // 資料夾可能已存在
            }
        })

        afterEach(async () => {
            try {
                await deleteFile(testFilePath)
            } catch (e) {
                // 忽略刪除失敗的錯誤
            }
        })

        it("should write a file", async () => {
            const result = await writeFile(testFilePath, testContent)
            expect(result).toBeDefined()
            
            const fileExists = await exists(testFilePath)
            expect(fileExists).toBe(true)
        })

        it("should read a file", async () => {
            await writeFile(testFilePath, testContent)
            const content = await read(testFilePath)
            expect(content).toBe(testContent)
        })

        it("should rename a file", async () => {
            await writeFile(testFilePath, testContent)
            const newFilePath = "local://test-file-folder/test-renamed.txt"
            
            const result = await renameFile(testFilePath, "test-renamed.txt")
            expect(result).toBeDefined()
            
            const oldExists = await exists(testFilePath)
            const newExists = await exists(newFilePath)
            expect(oldExists).toBe(false)
            expect(newExists).toBe(true)
            
            // 清理重命名後的檔案
            await deleteFile(newFilePath)
        })

        it("should delete a file", async () => {
            await writeFile(testFilePath, testContent)
            const beforeDelete = await exists(testFilePath)
            expect(beforeDelete).toBe(true)
            
            const result = await deleteFile(testFilePath)
            expect(result).toBeDefined()
            
            const afterDelete = await exists(testFilePath)
            expect(afterDelete).toBe(false)
        })
    })

    describe("move operations", () => {
        const sourcePath = "local://test-move-source"
        const destinationPath = "local://test-move-destination"

        afterEach(async () => {
            try {
                await deleteFolder(sourcePath)
            } catch (e) {
                // 忽略錯誤
            }
            try {
                await deleteFolder(destinationPath)
            } catch (e) {
                // 忽略錯誤
            }
        })

        it("should move a folder from one location to another", async () => {
            await createFolder(sourcePath)
            const result = await move(sourcePath, destinationPath)
            expect(result).toBeDefined()
            
            const sourceExists = await exists(sourcePath)
            const destExists = await exists(destinationPath)
            expect(sourceExists).toBe(false)
            expect(destExists).toBe(true)
        })
    })
})
