import { describe, expect, it } from "vitest"
import { createClient } from "."

const client = createClient("http://127.0.0.1:8888/")

const resp = await client.axios.post("/", {
    query: `mutation { login(username: "admin", password: "111111")  }`
})
if (resp.headers['set-cookie']) {
    client.axios.defaults.headers.cookie = resp.headers['set-cookie'][0];
}

describe("login", () => {
    it("my", async () => {
        let r = await client.query({ my: ["user_id", "username", "name", "canDelete", "canUpdate", "canView"] });
        expect(r.my.username).toBe("admin");
        expect(r.my.user_id).toBe(1);
        expect(r.my.canDelete).toBe(false);
        expect(r.my.canUpdate).toBe(true);
        expect(r.my.canView).toBe(true);
    })

    it("getConfig", async () => {
        expect(await client.config.get("company")).toBe("HostLink")
    })


    it("query system", async () => {
        let data = await client.query({
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

    it("granted", async () => {
        let data = await client.auth.granted(["fs.folder.create"]);

        expect(data).toContain("fs.folder.create");

    })

})

