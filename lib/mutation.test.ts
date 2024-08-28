import { describe, expect, it } from "vitest"
import { mutation, model, createClient } from "."

const client = createClient("http://127.0.0.1:8888/")

const resp = await client.axios.post("/", {
    query: `mutation { login(username: "admin", password: "111111")  }`
})
if (resp.headers['set-cookie']) {
    client.axios.defaults.headers.cookie = resp.headers['set-cookie'][0];
}


describe("mutation", () => {
    it("mutation", async () => {
        const resp = await mutation(client.axios, "updateUser", { id: 1, data: { first_name: "test" } })
        expect(resp).toBe(true);

        const u = await model("User").get({ user_id: 1 }, ["first_name"]);
        expect(u.first_name).toBe("test");
    });

    it("model update", async () => {
        await model("User").update(1, { first_name: "admin" })
        const u2 = await model("User").get({ user_id: 1 }, ["first_name"]);
        expect(u2.first_name).toBe("admin");
    });
});