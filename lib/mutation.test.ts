import { describe, expect, it } from "vitest"
import { createClient } from "."

const client = createClient("http://127.0.0.1:8888/")

const resp = await client.axios.post("/", {
    query: `mutation { login(username: "admin", password: "111111")  }`
})
if (resp.headers['set-cookie']) {
    client.axios.defaults.headers.cookie = resp.headers['set-cookie'][0];
}


describe("mutation", () => {
    it("mutation", async () => {
        expect(client.baseURL).toBe("http://127.0.0.1:8888/");

        const resp = await client.mutation("updateUser", { id: 1, data: { first_name: "test" } }, [])
        expect(resp).toBe(true);

        console.log(client.model("User"));
        const u = await client.model("User").get({ user_id: 1 }, ["first_name"])
        expect(u.first_name).toBe("test");
    });

    /*   it("model update", async () => {
          
  
  
          await client.model("User").update(1, { first_name: "admin" })
          const u2 = await client.model("User").get({ user_id: 1 }, ["first_name"]);
          expect(u2.first_name).toBe("admin");
      }); */
});