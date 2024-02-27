import { describe, expect, it } from "vitest"
import { mutation, model } from "."
import { setAxios } from "./axios"
import axios from "axios"

async function init() {
    axios.defaults.withCredentials = true;

    let server = axios.create({
        baseURL: "http://127.0.0.1:8888/"
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

describe("mutation", () => {
    it("mutation", async () => {
        const resp = await mutation("updateUser", { id: 1, data: { first_name: "test" } })
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