import { AxiosInstance } from "axios"
import { type Model, type Field } from "./model"
import { default as model } from './model';


export default (axios: AxiosInstance) => {
    const _axios = axios;

    const data: any = {};

    return {
        create(name: string, fields: Record<string, Field>) {
            data[name] = null;


            let f: any = {};

            for (const entry of Object.entries(fields)) {
                const [key, option] = entry;

                f[key] = (): Model => {
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


            data[name] = model(_axios, name, f);

        },
        get(name: string) {

            if (!data[name]) {
                //create new model
                this.create(name, {});
            }


            return data[name];
        }

    }
}