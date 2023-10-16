import { describe, expect, it } from "vitest"
import { setAxios } from "./axios"
import axios from "axios"
import { fsListFiles, fsListFolders, fsReadFile, fsWriteFile, fsDeleteFile } from "./fs";

async function init() {
    axios.defaults.withCredentials = true;

    let server = axios.create({
        baseURL: "http://127.0.0.1:8888/api/"
    });
    const resp = await server.post("/", {
        query: `mutation { login(username: "admin", password: "111111")  }`
    })
    if (resp.headers['set-cookie']) {
        server.defaults.headers.cookie = resp.headers['set-cookie'][0];
    }


    setAxios(server);
}
await init();

describe("fs", () => {

    it("fsListFile", async () => {

        //should be array of files
        expect(Array.isArray(await fsListFiles("/"))).toBe(true);


    });

    it("fsListFolders", async () => {

        //should be array of folders
        expect(Array.isArray(await fsListFolders("/"))).toBe(true);

    });



    it("fsReadFile", async () => {

        //random string
        let str = Math.random().toString(36).substring(7);
        //write file
        expect(await fsWriteFile("1.txt", str)).toBe(true);

        //should be string
        expect(await fsReadFile("1.txt")).toBe(str)


        //delete file
        expect(await fsDeleteFile("1.txt")).toBe(true);

    });


});