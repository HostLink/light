import { describe, expect, it, vi, beforeEach } from "vitest"
import createCollection from "./createCollection"

// Mock query function
vi.mock('./query', () => ({
    default: vi.fn()
}))

import query from './query'
const mockedQuery = vi.mocked(query)

describe("createCollection", () => {
    
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe("Collection Creation", () => {
        it("should create a collection with correct data_path", () => {
            const fields = { id: true, name: true }
            const collection = createCollection("User", fields)
            
            expect(collection.data_path).toBe("listUser")
            expect(collection.fields).toEqual(fields)
        })

        it("should initialize with default values", () => {
            const collection = createCollection("Product", {})
            
            expect(collection.filters).toEqual({})
            expect(collection.steps).toEqual([])
            expect(collection.already_limit).toBe(false)
            expect(collection.already_offset).toBe(false)
            expect(collection.limit).toBe(null)
            expect(collection.offset).toBe(null)
            expect(collection._sort).toBe(null)
            expect(collection._sortDesc).toBe(false)
            expect(collection.meta).toEqual({})
        })
    })

    describe("Query Building", () => {
        it("should build correct args with filters and sort", () => {
            const collection = createCollection("User", { id: true })
            collection.filters = { status: "active", age: { gt: 18 } }
            collection._sort = "name"
            collection._sortDesc = true
            
            const args = collection.buildArgs()
            
            expect(args).toEqual({
                filters: { status: "active", age: { gt: 18 } },
                sort: "name:desc"
            })
        })

        it("should build args without sort when not specified", () => {
            const collection = createCollection("User", { id: true })
            collection.filters = { status: "active" }
            
            const args = collection.buildArgs()
            
            expect(args).toEqual({
                filters: { status: "active" }
            })
        })

        it("should return empty args when no filters or sort", () => {
            const collection = createCollection("User", { id: true })
            
            const args = collection.buildArgs()
            
            expect(args).toEqual({})
        })
    })

    describe("Cloning", () => {
        it("should create a deep clone of the collection", () => {
            const collection = createCollection("User", { id: true })
            collection.filters = { status: "active" }
            collection.steps = [{ type: "sortBy", args: ["name"] }]
            
            const clone = collection.clone()
            
            // Should be different objects
            expect(clone).not.toBe(collection)
            expect(clone.filters).not.toBe(collection.filters)
            expect(clone.steps).not.toBe(collection.steps)
            expect(clone.fields).not.toBe(collection.fields)
            
            // But should have same values
            expect(clone.filters).toEqual(collection.filters)
            expect(clone.steps).toEqual(collection.steps)
            expect(clone.fields).toEqual(collection.fields)
        })
    })

    describe("Where Conditions", () => {
        it("should handle simple where condition", () => {
            const collection = createCollection("User", { id: true })
            
            const result = collection.where("status", "active")
            
            expect(result.filters).toEqual({ status: "active" })
            expect(result).toBe(collection) // Should return same instance
        })

        it("should handle where with operators", () => {
            const collection = createCollection("User", { id: true })
            
            collection.where("age", ">", 18)
            expect(collection.filters).toEqual({ age: { gt: 18 } })
            
            collection.where("score", "<=", 100)
            expect(collection.filters).toEqual({ 
                age: { gt: 18 }, 
                score: { lte: 100 } 
            })
            
            collection.where("name", "!==", "admin")
            expect(collection.filters).toEqual({ 
                age: { gt: 18 }, 
                score: { lte: 100 },
                name: { ne: "admin" }
            })
        })

        it("should handle whereContains", () => {
            const collection = createCollection("User", { id: true })
            
            collection.whereContains("name", "john")
            
            expect(collection.filters).toEqual({ name: { contains: "john" } })
        })

        it("should handle whereIn", () => {
            const collection = createCollection("User", { id: true })
            
            collection.whereIn("status", ["active", "pending"])
            
            expect(collection.filters).toEqual({ status: { in: ["active", "pending"] } })
        })

        it("should handle whereNotIn", () => {
            const collection = createCollection("User", { id: true })
            
            collection.whereNotIn("status", ["deleted", "banned"])
            
            expect(collection.filters).toEqual({ status: { nin: ["deleted", "banned"] } })
        })

        it("should handle whereBetween", () => {
            const collection = createCollection("User", { id: true })
            
            collection.whereBetween("age", [18, 65])
            
            expect(collection.filters).toEqual({ age: { between: [18, 65] } })
        })

        it("should handle whereNotBetween", () => {
            const collection = createCollection("User", { id: true })
            
            collection.whereNotBetween("score", [0, 50])
            
            expect(collection.filters).toEqual({ score: { notBetween: [0, 50] } })
        })
    })

    describe("Sorting", () => {
        it("should handle sortBy with string", () => {
            const collection = createCollection("User", { id: true })
            
            const result = collection.sortBy("name")
            
            expect(result.steps).toEqual([{ type: "sortBy", args: ["name"] }])
            expect(result._sort).toBe("name")
            expect(result._sortDesc).toBe(false)
        })

        it("should handle sortByDesc with string", () => {
            const collection = createCollection("User", { id: true })
            
            const result = collection.sortByDesc("created_at")
            
            expect(result.steps).toEqual([{ type: "sortByDesc", args: ["created_at"] }])
            expect(result._sort).toBe("created_at")
            expect(result._sortDesc).toBe(true)
        })

        it("should handle sortBy with function", () => {
            const collection = createCollection("User", { id: true })
            const sortFn = (item: any) => item.age
            
            const result = collection.sortBy(sortFn)
            
            expect(result.steps).toEqual([{ type: "sortBy", args: [sortFn] }])
            expect(result._sort).toBe(null) // Function sorting doesn't set _sort
        })
    })

    describe("Pagination", () => {
        it("should handle take method", () => {
            const collection = createCollection("User", { id: true })
            
            const result = collection.take(10)
            
            expect(result.limit).toBe(10)
            expect(result.already_limit).toBe(true)
            expect(result).toBe(collection)
        })

        it("should handle take method when already limited", () => {
            const collection = createCollection("User", { id: true })
            collection.already_limit = true
            
            const result = collection.take(5)
            
            expect(result.steps).toEqual([{ type: "take", args: [5] }])
        })

        it("should handle skip method", () => {
            const collection = createCollection("User", { id: true })
            
            const result = collection.skip(20)
            
            expect(result.offset).toBe(20)
            expect(result.already_offset).toBe(true)
        })

        it("should handle skip method when already offset", () => {
            const collection = createCollection("User", { id: true })
            collection.already_offset = true
            
            const result = collection.skip(10)
            
            expect(result.steps).toEqual([{ type: "skip", args: [10] }])
        })

        it("should handle forPage method", () => {
            const collection = createCollection("User", { id: true })
            
            const result = collection.forPage(2, 15)
            
            expect(result.limit).toBe(15)
            expect(result.offset).toBe(15) // (2-1) * 15
            expect(result.already_limit).toBe(true)
            expect(result.already_offset).toBe(true)
        })

        it("should handle forPage with page less than 1", () => {
            const collection = createCollection("User", { id: true })
            
            const result = collection.forPage(0, 10)
            
            expect(result.offset).toBe(0) // Math.max(1, 0) - 1 = 0
        })

        it("should handle splice method", () => {
            const collection = createCollection("User", { id: true })
            
            const result = collection.splice(10, 5)
            
            expect(result.steps).toEqual([{ type: "splice", args: [10, 5] }])
            expect(result.offset).toBe(10)
            expect(result.limit).toBe(5)
            expect(result.already_limit).toBe(true)
            expect(result.already_offset).toBe(true)
        })
    })

    describe("Data Path", () => {
        it("should set custom data path", () => {
            const collection = createCollection("User", { id: true })
            
            const result = collection.dataPath("custom.path.users")
            
            expect(result.data_path).toBe("custom.path.users")
            expect(result).not.toBe(collection) // Should return new instance
        })
    })

    describe("Query Payload", () => {
        it("should generate correct query payload", () => {
            const collection = createCollection("User", { 
                id: true, 
                name: true 
            })
            collection.where("status", "active")
            collection.sortBy("name")
            collection.take(10)
            collection.skip(5)
            
            const payload = collection.getQueryPayload()
            
            expect(payload).toEqual({
                data_path: "listUser",
                query: {
                    meta: {
                        total: true,
                        key: true,
                        name: true
                    },
                    __args: {
                        filters: { status: "active" },
                        sort: "name"
                    },
                    data: {
                        id: true,
                        name: true,
                        __args: {
                            limit: 10,
                            offset: 5
                        }
                    }
                },
                steps: [{ type: "sortBy", args: ["name"] }]
            })
        })
    })

    describe("Batch Data", () => {
        it("should use batch data when available", async () => {
            const collection = createCollection("User", { id: true })
            const batchData = {
                data: [{ id: 1, name: "John" }, { id: 2, name: "Jane" }],
                meta: { total: 2 }
            }
            collection._batchData = batchData
            
            const result = await collection.fetchData()
            
            expect(collection.meta).toEqual({ total: 2 })
            expect(result.all()).toEqual([{ id: 1, name: "John" }, { id: 2, name: "Jane" }])
            expect(mockedQuery).not.toHaveBeenCalled()
        })

        it("should add steps for where when using batch data", () => {
            const collection = createCollection("User", { id: true })
            collection._batchData = { data: [], meta: {} }
            
            collection.where("status", "active")
            
            expect(collection.steps).toEqual([{ type: "where", args: ["status", "active"] }])
        })
    })

    describe("Method Steps", () => {
        it("should add method steps correctly", () => {
            const collection = createCollection("User", { id: true })
            
            const result = collection.map((x: any) => x.name)
            
            expect(result.steps).toHaveLength(1)
            expect(result.steps[0].type).toBe("map")
            expect(result.steps[0].args).toHaveLength(1)
            expect(result).not.toBe(collection) // Should return cloned instance
        })

        it("should handle multiple chained operations", () => {
            const collection = createCollection("User", { id: true })
            
            const result = collection
                .sortBy("name")
                .chunk(5)
                .reverse()
            
            expect(result.steps).toHaveLength(3)
            expect(result.steps[0].type).toBe("sortBy")
            expect(result.steps[1].type).toBe("chunk")
            expect(result.steps[2].type).toBe("reverse")
        })
    })

    describe("Data Fetching", () => {
        it("should fetch data with correct query structure", async () => {
            const mockResponse = {
                listUser: {
                    data: [{ id: 1, name: "John" }],
                    meta: { total: 1 }
                }
            }
            mockedQuery.mockResolvedValue(mockResponse)
            
            const collection = createCollection("User", { 
                id: true, 
                name: true 
            })
            collection.where("status", "active")
            collection.take(10)
            
            const result = await collection.fetchData()
            
            expect(mockedQuery).toHaveBeenCalledWith({
                listUser: {
                    meta: {
                        total: true,
                        key: true,
                        name: true
                    },
                    __args: {
                        filters: { status: "active" }
                    },
                    data: {
                        id: true,
                        name: true,
                        __args: {
                            limit: 10
                        }
                    }
                }
            })
            
            expect(collection.meta).toEqual({ total: 1 })
            expect(result.all()).toEqual([{ id: 1, name: "John" }])
        })

        it("should handle nested data paths", async () => {
            const mockResponse = {
                admin: {
                    users: {
                        data: [{ id: 1 }],
                        meta: { total: 1 }
                    }
                }
            }
            mockedQuery.mockResolvedValue(mockResponse)
            
            const collection = createCollection("User", { id: true })
            collection.data_path = "admin.users"
            
            await collection.fetchData()
            
            expect(mockedQuery).toHaveBeenCalledWith({
                admin: {
                    users: {
                        meta: {
                            total: true,
                            key: true,
                            name: true
                        },
                        __args: {},
                        data: {
                            id: true
                        }
                    }
                }
            })
        })
    })

    describe("Process Data", () => {
        it("should process data with steps", async () => {
            const mockData = [
                { id: 1, name: "John", age: 25 },
                { id: 2, name: "Jane", age: 30 },
                { id: 3, name: "Bob", age: 20 }
            ]
            
            const mockResponse = {
                listUser: {
                    data: mockData,
                    meta: { total: 3 }
                }
            }
            mockedQuery.mockResolvedValue(mockResponse)
            
            const collection = createCollection("User", { 
                id: true, 
                name: true, 
                age: true 
            })
            
            const result = await collection
                .sortBy("age")
                .processData()
            
            // Should have called processData which fetches and processes
            expect(mockedQuery).toHaveBeenCalled()
            expect(result).toBeDefined()
        })
    })

    describe("Final Methods", () => {
        it("should handle all() method", async () => {
            const mockData = [{ id: 1, name: "John" }]
            const mockResponse = {
                listUser: {
                    data: mockData,
                    meta: { total: 1 }
                }
            }
            mockedQuery.mockResolvedValue(mockResponse)
            
            const collection = createCollection("User", { id: true, name: true })
            const result = await collection.all()
            
            expect(result).toEqual(mockData)
        })

        it("should handle first() method", async () => {
            const mockData = [
                { id: 1, name: "John" },
                { id: 2, name: "Jane" }
            ]
            const mockResponse = {
                listUser: {
                    data: mockData,
                    meta: { total: 2 }
                }
            }
            mockedQuery.mockResolvedValue(mockResponse)
            
            const collection = createCollection("User", { id: true, name: true })
            const result = await collection.first()
            
            expect(result).toEqual({ id: 1, name: "John" })
        })
    })

    describe("Edge Cases", () => {
        it("should handle empty fields object", () => {
            const collection = createCollection("Empty", {})
            
            expect(collection.fields).toEqual({})
            expect(collection.data_path).toBe("listEmpty")
        })

        it("should handle multiple where conditions", () => {
            const collection = createCollection("User", { id: true })
            
            collection
                .where("status", "active")
                .where("age", ">", 18)
                .where("role", "user")
            
            expect(collection.filters).toEqual({
                status: "active",
                age: { gt: 18 },
                role: "user"
            })
        })

        it("should handle chained pagination methods", () => {
            const collection = createCollection("User", { id: true })
            
            const result = collection
                .skip(10)
                .take(5)
                .forPage(2, 3) // This should add to steps since already_limit is true
            
            expect(result.offset).toBe(10)
            expect(result.limit).toBe(5)
            expect(result.steps).toContainEqual({ type: "forPage", args: [2, 3] })
        })

        it("should handle complex query with all operations", () => {
            const collection = createCollection("Product", { 
                id: true, 
                name: true, 
                price: true 
            })
            
            const result = collection
                .where("category", "electronics")
                .whereBetween("price", [100, 1000])
                .whereIn("status", ["active", "featured"])
                .sortByDesc("created_at")
                .skip(20)
                .take(10)
                .chunk(2)
            
            expect(result.filters).toEqual({
                category: "electronics",
                price: { between: [100, 1000] },
                status: { in: ["active", "featured"] }
            })
            expect(result._sort).toBe("created_at")
            expect(result._sortDesc).toBe(true)
            expect(result.offset).toBe(20)
            expect(result.limit).toBe(10)
            expect(result.steps).toContainEqual({ type: "sortByDesc", args: ["created_at"] })
            expect(result.steps).toContainEqual({ type: "chunk", args: [2] })
        })

        it("should handle query payload without limit and offset", () => {
            const collection = createCollection("Simple", { id: true })
            collection.where("active", true)
            
            const payload = collection.getQueryPayload()
            
            // __args should exist but be empty when no limit/offset
            expect(payload.query.data.__args).toEqual({})
        })

        it("should handle empty data path correctly", () => {
            const collection = createCollection("User", { id: true })
            collection.data_path = ""
            
            // This should work without error
            const payload = collection.getQueryPayload()
            expect(payload.data_path).toBe("")
        })

        it("should handle batch data with steps", () => {
            const collection = createCollection("User", { id: true })
            collection._batchData = { data: [], meta: {} }
            
            const result = collection
                .whereContains("name", "john")
                .whereIn("role", ["admin", "user"])
                .sortBy("name")
            
            expect(result.steps).toHaveLength(3)
            expect(result.steps[0]).toEqual({ type: "whereContains", args: ["name", "john"] })
            expect(result.steps[1]).toEqual({ type: "whereIn", args: ["role", ["admin", "user"]] })
            expect(result.steps[2]).toEqual({ type: "sortBy", args: ["name"] })
        })

        it("should handle all operators in where conditions", () => {
            const collection = createCollection("User", { id: true })
            
            collection.where("score1", "<", 50)
            collection.where("score2", "<=", 75)
            collection.where("score3", ">", 80)
            collection.where("score4", ">=", 90)
            collection.where("score5", "!==", 0)
            collection.where("score6", "==", 100)
            
            expect(collection.filters).toEqual({
                score1: { lt: 50 },
                score2: { lte: 75 },
                score3: { gt: 80 },
                score4: { gte: 90 },
                score5: { ne: 0 },
                score6: 100
            })
        })
    })
})
