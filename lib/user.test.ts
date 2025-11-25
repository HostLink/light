import { describe, expect, it, beforeAll } from "vitest"
import { createClient, setApiClient } from "."
import { useUsers } from "."

const client = createClient("http://localhost:8888/")

describe("users", () => {
    beforeAll(async () => {
        // Set the global API client
        setApiClient(client);
        
        // 登入以確保有權限存取 drive 功能
        const loginResult = await client.auth.login("admin", "111111")
        expect(loginResult).toBe(true)
    })

    it("list", async () => {

        const { fetchUsers, users } = useUsers();

        await fetchUsers();
        // Check if users were fetched (either greater than 0 or exactly 0 if no users exist)
        expect(Array.isArray(users)).toBe(true);

    });

});