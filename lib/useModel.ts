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
export const createModelManager = (axios: AxiosInstance): ModelManager => {
    const _axios = axios
    const data: Record<string, any> = {}

    return {
        /**
         * 創建新模型
         * @param name 模型名稱
         * @param fields 模型欄位定義
         */
        create(name: string, fields: Record<string, Field>) {
            data[name] = null

            let f: any = {}

            for (const entry of Object.entries(fields)) {
                const [key, option] = entry

                f[key] = (): Model => {
                    return {
                        name: option.name ? option.name : key,
                        raw: option,
                        getName: () => {
                            return option.name ? option.name : key
                        },
                        getGQLField: (): string | object => {
                            return option.gqlField !== undefined ? option.gqlField : option.name || key
                        },
                        getRaw() {
                            return option
                        },
                        getValue(model: any) {
                            if (option.field && typeof option.field == 'function') {
                                return option.field(model)
                            }

                            // if field is string
                            if (option.field && typeof option.field == 'string') {
                                return model[option.field]
                            }

                            return model[this.getName()]
                        },
                        getFormattedValue(model: any) {
                            const v = this.getValue(model)
                            if (option.format) {
                                return option.format(v)
                            }
                            return v
                        }
                    }
                }
            }

            data[name] = model(_axios, name, f)
            
            // 同步到全域存儲
            globalModels[name] = data[name]
        },

        /**
         * 獲取模型
         * @param name 模型名稱
         * @returns 模型實例
         */
        get(name: string) {
            if (!data[name]) {
                // 嘗試從全域存儲獲取
                if (globalModels[name]) {
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
            return !!data[name] || !!globalModels[name]
        },

        /**
         * 列出所有模型名稱
         * @returns 模型名稱陣列
         */
        list(): string[] {
            return [...new Set([...Object.keys(data), ...Object.keys(globalModels)])]
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
    const manager = createModelManager(axios)

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
 */
export const useGlobalModels = (axios: AxiosInstance) => {
    return {
        /**
         * 創建全域模型
         * @param name 模型名稱
         * @param fields 模型欄位定義
         */
        define(name: string, fields: Record<string, Field>) {
            const manager = createModelManager(axios)
            manager.create(name, fields)
            globalModels[name] = manager.get(name)
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
