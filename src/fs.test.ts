import { describe, expect, it, beforeAll } from "vitest"
import { createClient } from "."

const client = createClient("http://localhost:8888/")

describe("fs", () => {
    beforeAll(async () => {
        // 使用統一的登入方式
        const loginResult = await client.auth.login("admin", "111111")
        expect(loginResult).toBe(true)
    })

    it("fsListFile", async () => {

        //should be array of files
        expect(Array.isArray(await client.fs.files.list("/"))).toBe(true);
    });

    it("fsListFolders", async () => {
        //should be array of folders
        expect(Array.isArray(await client.fs.folders.list("/"))).toBe(true);
    });

    it("fsReadFile", async () => {

        //random string
        let str = Math.random().toString(36).substring(7);
        //write file
        expect(await client.fs.files.write("1.txt", str)).toBe(true);

        //should be string
        //expect(await fsReadFile("1.txt")).toBe(str)


        //delete file
        expect(await client.fs.files.delete("1.txt")).toBe(true);

    });


});