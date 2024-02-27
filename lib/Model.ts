import { VariableType } from "json-to-graphql-query";
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

const data: any = {};

export const defineModel = (name: string, fields: { [key: string]: FieldOption }) => {

    data[name] = {};

    for (const entry of Object.entries(fields)) {
        const [key, option] = entry;

        data[name][key] = (): ModelField => {
            return {
                name: option.name ? option.name : key,
                raw: option,
                getName: () => {
                    return option.name ? option.name : key;
                },
                getGQLField: (): string | object => {
                    return option.gqlField !== undefined ? option.gqlField : option.name || key;
                },
                getRaw() {
                    return option;
                },
                getValue(model: any) {
                    if (option.field && typeof option.field == 'function') {
                        return option.field(model)
                    }

                    //if field is string
                    if (option.field && typeof option.field == 'string') {
                        return model[option.field]
                    }

                    return model[this.getName()]
                },
                getFormattedValue(model: any) {
                    const v = this.getValue(model);
                    if (option.format) {
                        return option.format(v)
                    }
                    return v;
                }
            }
        }
    }
}

export const getModelField = (name: string, field: string): ModelField | null => {
    if (!data[name]) {
        return null;
    }
    if (!data[name][field]) {
        return null;
    }

    return data[name][field]();
}


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

export const model = (name: string) => {

    const _name = name;

    return {
        name: _name,
        $fields: data[name],
        async update(id: number, data: Object) {
            return await mutation('update' + _name, { id, data })
        },
        async delete(id: number) {
            return await mutation('delete' + _name, { id })
        },
        async add(data: Object) {
            return await mutation('add' + _name, { data })
        },
        fields(fields: string[]) {
            let result: Array<ModelField> = [];

            for (let field of fields) {
                const f = getModelField(_name, field);
                if (!f) continue;

                result.push(f);
            }
            return result;
        },
        async get(filters: any, fields: Fields) {

            const resp = await query({
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
            const resp = await query({
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



