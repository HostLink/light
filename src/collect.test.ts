import { beforeAll, describe, it } from "vitest"
import { createClient } from "."

const client = createClient("http://127.0.0.1:8888/")

describe("collect", () => {
    beforeAll(async () => {
        await client.auth.login("admin", "111111")
    })

    it("collectAll", async () => {
        await client.collect("MailLog", { maillog_id: true }).all();
    });
});
