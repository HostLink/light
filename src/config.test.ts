import { describe, expect, it, beforeAll } from "vitest"
import { createClient, setApiClient } from "."
import { getConfig } from "./config";

const client = createClient("http://localhost:8888/")

describe("users", () => {
    beforeAll(async () => {
        // Set the global API client
        setApiClient(client);

        // 登入以確保有權限存取 drive 功能
        const loginResult = await client.auth.login("admin", "111111")
        expect(loginResult).toBe(true)
    })

    it("get", async () => {

        const config = await getConfig("company");

        expect(config).toBeDefined();

    });

});