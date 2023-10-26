
export type ModelField = {
    getName: () => string,
    getGQLField: () => string | object,
    getRaw: () => FieldOption,
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
        const [key, value] = entry;

        data[name][key] = (): ModelField => {
            return {
                getName: () => {
                    return value.name ? value.name : key;
                },
                getGQLField: (): string | object => {
                    return value.gqlField !== undefined ? value.gqlField : value.name || key;
                },
                getRaw: () => {
                    return value;
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
    const result: any = [];
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




