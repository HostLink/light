import { describe, expect, it } from "vitest"
import { createClient } from "."

const client = createClient("http://127.0.0.1:8888/")

const resp = await client.axios.post("/", {
    query: `mutation { login(username: "admin", password: "111111")  }`
})
if (resp.headers['set-cookie']) {
    client.axios.defaults.headers.cookie = resp.headers['set-cookie'][0];
}


describe("roles", () => {

    it("list", async () => {
        const roles = (await client.roles.list());
        expect(roles).toBeInstanceOf(Array);
        expect(roles.length).toBeGreaterThan(0);
    });

});