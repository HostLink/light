import { type Field } from "./model"
import model from './model'

// 全域模型存儲
const models: Record<string, ReturnType<typeof model>> = {}

/**
 * 創建或更新模型
 * @param name 模型名稱
 * @param fields 模型欄位定義
 * @returns 模型實例
 */
export const defineModel = (name: string, fields: Record<string, Field>) => {
    const modelInstance = model(name, fields)
    models[name] = modelInstance
    return modelInstance
}

/**
 * 獲取模型
 * @param name 模型名稱
 * @returns 模型實例
 */
export const getModel = (name: string) => {
    if (!models[name]) {
        return defineModel(name, {})
    }
    return models[name]
}

/**
 * 檢查模型是否存在
 * @param name 模型名稱
 * @returns 是否存在
 */
export const hasModel = (name: string): boolean => {
    return !!models[name]
}

/**
 * 列出所有模型名稱
 * @returns 模型名稱陣列
 */
export const listModels = (): string[] => {
    return Object.keys(models)
}

/**
 * 清除所有模型
 */
export const clearModels = () => {
    Object.keys(models).forEach(key => delete models[key])
}

/**
 * 批量創建模型
 * @param modelDefinitions 模型定義對象
 */
export const defineModels = (modelDefinitions: Record<string, Record<string, Field>>) => {
    Object.entries(modelDefinitions).forEach(([name, fields]) => {
        defineModel(name, fields)
    })
}

// 默認導出
export default {
    defineModel,
    getModel,
    hasModel,
    listModels,
    clearModels,
    defineModels
}
