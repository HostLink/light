import { describe, expect, it, beforeAll } from "vitest"
import { createClient, setApiClient } from "."
const client = createClient("http://localhost:8888/")

describe("role", () => {
    beforeAll(async () => {
        setApiClient(client);
        // 登入以確保有權限存取 role 功能
        const loginResult = await client.auth.login("admin", "111111")
        expect(loginResult).toBe(true)
    })

    describe("listRoles", () => {
        it("should return an array of roles", async () => {
            const roles = await client.roles.list();
            expect(roles).toBeInstanceOf(Array);
            expect(roles.length).toBeGreaterThan(0);
        });

        it("should contain role with expected fields", async () => {
            const roles = await client.roles.list();
            expect(roles[0]).toHaveProperty("name");
        });
    });

    describe("createRole", () => {
        it("should create a new role successfully", async () => {
            const testRoleName = `test-role-${Date.now()}`;
            const result = await client.roles.create(testRoleName, []);
            expect(result).toBe(true);
            // 清理：測試完成後刪除建立的角色
            await client.roles.delete(testRoleName);
        });

        it("should create a role with children", async () => {
            const roleName = `test-role-with-children-${Date.now()}`;
            const result = await client.roles.create(roleName, ["user", "admin"]);
            expect(result).toBe(true);
            // 清理：測試完成後刪除建立的角色
            await client.roles.delete(roleName);
        });
    });

    describe("deleteRole", () => {
        it("should delete a role successfully", async () => {
            const roleName = `test-delete-role-${Date.now()}`;
            // 先建立角色
            await client.roles.create(roleName, []);
            // 再刪除
            const result = await client.roles.delete(roleName);
            expect(result).toBe(true);
        });
    });
});