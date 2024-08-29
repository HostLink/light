import { AxiosInstance } from "axios"

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
export default (axios: AxiosInstance) => {

    const data: any = {};
    return {
        create(name: string, fields: { [key: string]: FieldOption }) {
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

            return data[name];
        },
        get(name: string) {
            return data[name];
        }

    }
}