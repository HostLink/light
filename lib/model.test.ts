import { describe, expect, it } from "vitest"
import { defineModel, getModelField } from "../lib/model"

defineModel("Client", {
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
        const field = getModelField("Client", "client_no")
        expect(field?.getName()).toBe("client_no");
    })

    it("format", () => {
        const field = getModelField("Client", "client_no")
        expect(field?.getFormattedValue({ client_no: "123" })).toBe("000123");
    })

    it("gqlField", () => {
        const field = getModelField("Client", "name")
        expect(field?.getGQLField()).toEqual(["first_name", "last_name"]);
    });

});
