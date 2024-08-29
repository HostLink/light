import { AxiosInstance } from "axios";
import { toQuery, query, mutation, type Fields } from ".";

export type ModelField = {
    name: string,
    raw: FieldOption,
    getName: () => string,
    getGQLField: () => string | object,
    getRaw: () => FieldOption,
    getValue: (model: object) => any,
    getFormattedValue: (model: object) => any,
}

export type FieldOption = {
    label: string,
    name?: string
    gqlField?: string | object,
    sortable?: boolean,
    searchable?: boolean,
    searchableType?: string,
    align?: string,
    field?: any,
    format?: any,
}

export default (axios: AxiosInstance, name: string, fields: any) => {
    const _name = name;
    const _axios = axios;
    const _fields = fields;
    
    const field = (f: string): ModelField | null => {
        
        if (!_fields[f]) {
            return null;
        }
        return _fields[f]();
    }

    return {
        field,
        $fields: _fields,
        gqlFields(fields: (string | object)[]) {
            const result: Array<any> = [];
            for (const f of fields) {

                if (typeof f === 'string') {
                    const mf = field(f)
                    if (mf) {
                        result.push(mf.getGQLField());
                    }
                } else if (typeof f === 'object') {
                    result.push(f)
                }
            }


            return result;
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
            let result: Array<ModelField> = [];

            for (let f of fields) {
                const f1 = field(f);
                if (!f1) continue;

                result.push(f1);
            }
            return result;
        },
        async get(filters: any, fields: Fields) {

            const resp = await query(_axios, {
                ['list' + _name]: {
                    __args: {
                        filters
                    },
                    data: {
                        __args: {
                            limit: 1
                        },
                        ...toQuery(fields)
                    }

                }
            })

            return resp['list' + _name]['data'][0];

        },
        async list(filters: any, fields: Fields) {
            const resp = await query(_axios, {
                ['list' + _name]: {
                    __args: {
                        filters
                    },
                    data: {
                        ...toQuery(fields)
                    }

                }
            })

            return resp['list' + _name]['data'];
        }
    }

};

/* 

export const getGQLFields = (model: string, fields: (string | object)[]) => {
    const result: Array<any> = [];
    for (const field of fields) {

        if (typeof field === 'string') {
            const mf = getModelField(model, field)
            if (mf) {
                result.push(mf.getGQLField());
            }
        } else if (typeof field === 'object') {
            result.push(field)
        }
    }


    return result;
}
 */
