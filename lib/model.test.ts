import { describe, expect, it } from "vitest"
import { createClient } from "."

const client = createClient("http://127.0.0.1:8888/")

client.models.create("Client", {
    client_no: {
        label: 'Client No',
        format: (v: any) => {
            return "000" + v
        }
    },
    name: {
        label: 'Client name',
        gqlField: ["first_name", "last_name"]
    }
})

describe("model", () => {
    it("getModelField", () => {
        const field = client.model("Client").field("client_no");
        expect(field?.getName()).toBe("client_no");
    })

    it("format", () => {
        const field = client.model("Client").field("client_no");
        expect(field?.getFormattedValue({ client_no: "123" })).toBe("000123");
    })

    it("gqlField", () => {
        const field = client.model("Client").field("name")
        expect(field?.getGQLField()).toEqual(["first_name", "last_name"]);
    });

});
