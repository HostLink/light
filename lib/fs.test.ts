import { describe, expect, it } from "vitest"
import { createClient } from "."

const client = createClient("http://127.0.0.1:8888/")

const resp = await client.axios.post("/", {
    query: `mutation { login(username: "admin", password: "111111")  }`
})
if (resp.headers['set-cookie']) {
    client.axios.defaults.headers.cookie = resp.headers['set-cookie'][0];
}


describe("fs", () => {

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