import { createClient } from "../lib/index.ts"
import { default as model } from "../lib/model.ts"
const client = createClient("http://127.0.0.1:8888/");



await client.auth.login("admin", "111111");

const m = model(client.axios, "User", {
    Name: {
        label: "Username",
        gqlField: {
            first_name: true,
            last_name: true,
        }, format: (model: any) => {
            return model.first_name + " " + model.last_name;
        },


    }
})



client.axios.interceptors.request.use((config) => {
    config.headers["Authorization"] = "Bearer " + "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJsaWdodCBzZXJ2ZXIiLCJqdGkiOiI1MmFmNmY2MS0xYWUzLTRkZmMtYjQzNC0xMTRkODU1YjU5MDkiLCJpYXQiOjE3NTk3MjI2NzgsImV4cCI6MTc1OTc1MTQ3OCwicm9sZSI6IlVzZXJzIiwiaWQiOjEsInR5cGUiOiJhY2Nlc3NfdG9rZW4ifQ.ir4c03XrDK54ZGLsOtqWiZmp0nXpERS6gQuhtd-LwuI";
    return config;
});

console.log(await m.list({
    Name: true
}).sort("username:desc")

    .all());



client.models.create("User", {
    Name: {
        label: "Username",
        gqlField: {
            first_name: true,
            last_name: true,
        }, format: (model: any) => {
            return model.first_name + " " + model.last_name;
        },

    }
})
const m2 = client.models.get("User");

console.log(await m2.list({
    Name: true
}).sort("username:desc").all())