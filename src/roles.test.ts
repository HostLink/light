import { describe, expect, inject, it, beforeAll } from "vitest"
import { createClient, setApiClient } from "."
const client = createClient("http://localhost:8888/")


describe("roles", () => {
    beforeAll(async () => {
        setApiClient(client);
        // 登入以確保有權限存取 drive 功能
        const loginResult = await client.auth.login("admin", "111111")
        expect(loginResult).toBe(true)
    })

    it("list", async () => {
        const roles = (await client.roles.list());
        expect(roles).toBeInstanceOf(Array);
        expect(roles.length).toBeGreaterThan(0);
    });

});