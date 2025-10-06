import { AxiosInstance } from "axios";
import { toQuery, mutation, type Fields } from ".";
import { default as createList } from './createList';
import { defu } from "defu";


export type Field = {
    name?: string

    /**
     * @deprecated use gql instead
     */
    gqlField?: string | object,

    gql?: Record<string, any>,
  
    field?: any,
    format?: any,
}

export type Model = {
    name: string,
    fields: Record<string, Field>,
}

export default (axios: AxiosInstance, name: string, fields: Record<string, Field>) => {
    const _name = name;
    const _axios = axios;
    const _fields = fields;
    let _dataPath = "list" + name;

    const field = (f: string): Field | null => {
        if (!_fields[f]) {
            return null;
        }
        return _fields[f];
    }

    return {
        field,
        $fields: _fields,
        setDataPath(path: string) {
            _dataPath = path;
            return _dataPath;
        },
        getDataPath() {
            return _dataPath;
        },
        gqlFields(fields: (string | object)[]) {
            let fs: Record<string, any> = {};
            for (const f of fields) {
                if (typeof f === 'string') {
                    const mf = field(f)
                    if (mf) {
                        fs = defu(fs, mf.gqlField ? (typeof mf.gqlField === 'string' ? { [mf.gqlField]: true } : mf.gqlField) : { [mf.name || f]: true });
                    }
                } else if (typeof f === 'object') {
                    fs = defu(fs, f);
                }
            }
            return fs;
        }, async update(id: number, data: Object) {
            return await mutation(_axios, 'update' + _name, { id, data })
        },
        async delete(id: number) {
            return await mutation(_axios, 'delete' + _name, { id })
        },
        async add(data: Object) {
            return await mutation(_axios, 'add' + _name, { data })
        },
        fields(fields: string[]) {
            let result: Array<Field> = [];

            for (let f of fields) {
                const f1 = field(f);
                if (!f1) continue;

                result.push(f1);
            }
            return result;
        },
        async get(filters: any, fields: Fields) {
            // 使用 createCollection 來獲取單筆資料
            const createCollection = (await import('./createCollection')).default;
            const collection = createCollection(_name, _axios, toQuery(fields));

            // 應用過濾器
            for (const [key, value] of Object.entries(filters)) {
                collection.where(key, '==', value);
            }

            return await collection.first();
        },
        list(fields: Record<string, any>) {
            let f: Record<string, any> = fields;
            const fieldConfigs: Record<string, any> = {};

            Object.entries(fields).forEach(([key]) => {
                if (_fields[key]) {
                    // 保存欄位配置（包含 format 函數）
                    fieldConfigs[key] = _fields[key];

                    if (_fields[key].gqlField) {
                        //remove the original field
                        delete f[key];
                        //merge the gqlField
                        f = defu(f, _fields[key].gqlField);
                    }

                    if (_fields[key].gql) {
                        f = defu(f, _fields[key].gql);
                        delete f[key]; // 移除原始欄位以避免重複
                    }
                }
            });

            const originalList = createList(_axios, _name, f).dataPath(_dataPath);

            // 包裝原始的 fetch 方法
            const originalFetch = originalList.fetch.bind(originalList);

            return {
                ...originalList,
                async fetch() {
                    const data = await originalFetch();

                    // 應用格式化函數
                    return data.map((item: any) => {
                        const formattedItem = { ...item };

                        Object.entries(fieldConfigs).forEach(([fieldName, fieldConfig]) => {
                            if (fieldConfig.format && typeof fieldConfig.format === 'function') {
                                formattedItem[fieldName] = fieldConfig.format(item);
                            }
                        });

                        return formattedItem;
                    });
                }, async fetchFirst() {
                    // 包裝原始的 fetchFirst 方法
                    const originalFetchFirst = originalList.fetchFirst.bind(originalList);
                    const data = await originalFetchFirst();

                    // 如果沒有資料，直接返回
                    if (!data) return data;

                    // 應用格式化函數到單筆資料
                    const formattedItem = { ...data };

                    Object.entries(fieldConfigs).forEach(([fieldName, fieldConfig]) => {
                        if (fieldConfig.format && typeof fieldConfig.format === 'function') {
                            formattedItem[fieldName] = fieldConfig.format(data);
                        }
                    });

                    return formattedItem;
                }
            };
        }
    }
};
