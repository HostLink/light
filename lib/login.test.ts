import { describe, expect, it } from "vitest"
import { query, getConfig } from "."
import { setAxios } from "./axios"
import axios from "axios"

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

describe("login", () => {
    it("my", async () => {
        let r = await query({ my: ["username", "name", "canDelete", "canUpdate", "canView"] });
        expect(r.my.username).toBe("admin");
        expect(r.my.name).toBe("admin");
        expect(r.my.canDelete).toBe(false);
        expect(r.my.canUpdate).toBe(true);
        expect(r.my.canView).toBe(true);
    })

    it("getConfig", async () => {
        expect(await getConfig("company")).toBe("HostLink")
    })


    it("query system", async () => {
        let data = await query({
            system: ["diskUsageSpace", "diskFreeSpacePercent", "diskFreeSpace", "diskTotalSpace", "package", "company", "companyLogo"]
        })
        expect(data.system.diskUsageSpace).toBeDefined();
        expect(data.system.diskFreeSpacePercent).toBeDefined();
        expect(data.system.diskFreeSpace).toBeDefined();
        expect(data.system.diskTotalSpace).toBeDefined();
        expect(data.system.package).toBeDefined();
        expect(data.system.company).toBeDefined();
        expect(data.system.companyLogo).toBeDefined();
    })


})

