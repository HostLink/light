import { AxiosInstance } from "axios"
import { type Model, type Field } from "./model"
import { default as model } from './model'

// 模型管理器的類型定義
export interface ModelManager {
    create: (name: string, fields: Record<string, Field>) => void
    get: (name: string) => any
    has: (name: string) => boolean
    list: () => string[]
    clear: () => void
}

// 全域模型存儲
const globalModels: Record<string, any> = {}

/**
 * 創建模型管理器的工廠函數
 * @param axios AxiosInstance 實例
 * @returns ModelManager 實例
 */
export const createModelManager = (axios: AxiosInstance, useGlobal: boolean = false): ModelManager => {
    const _axios = axios
    const data: Record<string, any> = {}

    return {
        /**
         * 創建新模型
         * @param name 模型名稱
         * @param fields 模型欄位定義
         */
        create(name: string, fields: Record<string, Field>) {
            const modelInstance = model(_axios, name, fields)
            data[name] = modelInstance

            // 只有在明確指定使用全域時才同步到全域存儲
            if (useGlobal) {
                globalModels[name] = modelInstance
            }
        },

        /**
         * 獲取模型
         * @param name 模型名稱
         * @returns 模型實例
         */
        get(name: string) {
            if (!data[name]) {
                // 如果啟用全域模式，嘗試從全域存儲獲取
                if (useGlobal && globalModels[name]) {
                    data[name] = globalModels[name]
                } else {
                    // 創建新模型
                    this.create(name, {})
                }
            }

            return data[name]
        },

        /**
         * 檢查模型是否存在
         * @param name 模型名稱
         * @returns 是否存在
         */
        has(name: string): boolean {
            return !!data[name] || (useGlobal && !!globalModels[name])
        },

        /**
         * 列出所有模型名稱
         * @returns 模型名稱陣列
         */
        list(): string[] {
            const localKeys = Object.keys(data)
            const globalKeys = useGlobal ? Object.keys(globalModels) : []
            return [...new Set([...localKeys, ...globalKeys])]
        },

        /**
         * 清除所有模型
         */
        clear() {
            Object.keys(data).forEach(key => delete data[key])
        }
    }
}

/**
 * 主要的 useModel hook
 * @param axios AxiosInstance 實例
 * @returns 模型管理器和便利方法
 */
export const useModel = (axios: AxiosInstance) => {
    const manager = createModelManager(axios, false) // 不使用全域

    return {
        // 暴露完整的管理器
        manager,

        // 便利方法 - 直接暴露常用功能
        createModel: manager.create,
        getModel: manager.get,
        hasModel: manager.has,
        listModels: manager.list,
        clearModels: manager.clear,

        /**
         * 快速創建並獲取模型
         * @param name 模型名稱
         * @param fields 模型欄位定義
         * @returns 模型實例
         */
        defineModel(name: string, fields: Record<string, Field>) {
            manager.create(name, fields)
            return manager.get(name)
        },

        /**
         * 批量創建模型
         * @param models 模型定義對象
         */
        defineModels(models: Record<string, Record<string, Field>>) {
            Object.entries(models).forEach(([name, fields]) => {
                manager.create(name, fields)
            })
        }
    }
}

/**
 * 創建一個會自動使用全域模型的 useModel
 * @param axios AxiosInstance 實例
 * @returns 使用全域模型的管理器
 */
export const useGlobalModel = (axios: AxiosInstance) => {
    const manager = createModelManager(axios, true) // 使用全域

    return {
        // 暴露完整的管理器
        manager,

        // 便利方法 - 直接暴露常用功能
        createModel: manager.create,
        getModel: manager.get,
        hasModel: manager.has,
        listModels: manager.list,
        clearModels: manager.clear,

        /**
         * 快速創建並獲取模型
         * @param name 模型名稱
         * @param fields 模型欄位定義
         * @returns 模型實例
         */
        defineModel(name: string, fields: Record<string, Field>) {
            manager.create(name, fields)
            return manager.get(name)
        },

        /**
         * 批量創建模型
         * @param models 模型定義對象
         */
        defineModels(models: Record<string, Record<string, Field>>) {
            Object.entries(models).forEach(([name, fields]) => {
                manager.create(name, fields)
            })
        }
    }
}

/**
 * 全域模型管理器 - 用於跨組件共享模型
 * 所有創建的模型都會儲存在全域範圍內，可以在不同的組件或模組中共享
 */
export const useGlobalModels = (axios: AxiosInstance) => {
    return {
        /**
         * 創建全域模型
         * @param name 模型名稱
         * @param fields 模型欄位定義
         */
        define(name: string, fields: Record<string, Field>) {
            const modelInstance = model(axios, name, fields)
            globalModels[name] = modelInstance
            return modelInstance
        },

        /**
         * 獲取全域模型
         * @param name 模型名稱
         * @returns 模型實例
         */
        get(name: string) {
            return globalModels[name]
        },

        /**
         * 檢查全域模型是否存在
         * @param name 模型名稱
         * @returns 是否存在
         */
        has(name: string): boolean {
            return !!globalModels[name]
        },

        /**
         * 列出所有全域模型
         * @returns 模型名稱陣列
         */
        list(): string[] {
            return Object.keys(globalModels)
        },

        /**
         * 清除所有全域模型
         */
        clear() {
            Object.keys(globalModels).forEach(key => delete globalModels[key])
        }
    }
}

// 默認導出 useModel
export default useModel
