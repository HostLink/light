import { AxiosInstance } from "axios"
import { type ModelField, type FieldOption } from "./model"

export default (axios: AxiosInstance) => {

    let data: any = {};
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