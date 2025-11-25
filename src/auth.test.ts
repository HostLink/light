import { describe, expect, it, beforeAll } from "vitest"
import { createClient } from "."
import { useAuth } from "."

// 使用 localhost 而不是 127.0.0.1，有時候在 cookie 處理上會有不同
const client = createClient("http://localhost:8888/")

describe("login", () => {
    beforeAll(async () => {
        // 使用 client.auth.login 方法進行登入，確保 cookies 正確處理
        const { login } = useAuth(client.axios)
        const loginResult = await login("admin", "111111")
        expect(loginResult).toBe(true)
    })
    it("my", async () => {
        let r = await client.query({
            my: {
                user_id: true,
                username: true,
                name: true,
                canDelete: true,
                canUpdate: true,
                canView: true
            }
        });
        expect(r.my.username).toBe("admin");
        expect(r.my.user_id).toBe(1);
        expect(r.my.canDelete).toBe(false);
        expect(r.my.canUpdate).toBe(true);
        expect(r.my.canView).toBe(true);
    })


    it("query system", async () => {
        let data = await client.query({
            system: {
                diskUsageSpace: true,
                diskFreeSpacePercent: true,
                diskFreeSpace: true,
                diskTotalSpace: true,
                package: true,
                company: true,
                companyLogo: true
            }
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

