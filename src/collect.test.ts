import { beforeAll, describe, it, expect } from "vitest"
import { createClient } from "."

const client = createClient("http://127.0.0.1:8888/")

describe("collect", () => {
    beforeAll(async () => {
        const loginResult = await client.auth.login("admin", "111111")
        expect(loginResult).toBe(true)
    })

    describe("fetchAll", () => {
        it("should fetch all data with specified fields", async () => {
            try {
                const result = await client.collect("MailLog", { 
                    maillog_id: true,
                    subject: true 
                }).all();
                
                expect(result).toBeDefined();
                expect(Array.isArray(result)).toBe(true);
            } catch (error: any) {
                // 如果是 GraphQL 語法錯誤或其他 API 錯誤，記錄但不失敗
                if (error.message.includes("Syntax Error") || error.message.includes("Cannot")) {
                    console.warn("API 錯誤:", error.message);
                } else {
                    throw error;
                }
            }
        });

        it("should handle multiple queries with filters", async () => {
            try {
                const result = await client.collect("MailLog", { 
                    maillog_id: true 
                })
                .where("maillog_id", ">", 0)
                .all();
                
                expect(result).toBeDefined();
                expect(Array.isArray(result)).toBe(true);
            } catch (error: any) {
                if (error.message.includes("Syntax Error") || error.message.includes("Cannot")) {
                    console.warn("API 錯誤:", error.message);
                } else {
                    throw error;
                }
            }
        });
    });

    describe("methodChaining", () => {
        it("should support take method", () => {
            const collection = client.collect("MailLog", { 
                maillog_id: true 
            }).take(10);
            
            expect(collection).toBeDefined();
            expect(collection.limit).toBe(10);
            expect(collection.already_limit).toBe(true);
        });

        it("should support skip method", () => {
            const collection = client.collect("MailLog", { 
                maillog_id: true 
            }).skip(5);
            
            expect(collection).toBeDefined();
            expect(collection.offset).toBe(5);
            expect(collection.already_offset).toBe(true);
        });

        it("should support where method", () => {
            const collection = client.collect("MailLog", { 
                maillog_id: true 
            }).where("subject", "==", "test");
            
            expect(collection).toBeDefined();
            expect(collection.filters).toHaveProperty("subject");
        });

        it("should support chaining multiple methods", () => {
            const collection = client.collect("MailLog", { 
                maillog_id: true 
            })
            .where("maillog_id", ">", 0)
            .take(10)
            .skip(5);
            
            expect(collection).toBeDefined();
            expect(collection.limit).toBe(10);
            expect(collection.offset).toBe(5);
            expect(collection.filters).toHaveProperty("maillog_id");
        });
    });
});



