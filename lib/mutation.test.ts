import { describe, expect, it, beforeAll } from "vitest"
import { createClient } from "."

const client = createClient("http://localhost:8888/")

describe("mutation", () => {
    beforeAll(async () => {
        // 使用統一的登入方式
        const loginResult = await client.auth.login("admin", "111111")
        expect(loginResult).toBe(true)
    })
    it("mutation", async () => {
        expect(client.baseURL).toBe("http://localhost:8888/");

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