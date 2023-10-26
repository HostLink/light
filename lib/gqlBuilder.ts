import { toQuery } from ".";

export default function () {

    const merge = (obj1: any, obj2: any) => {
        for (let key in obj2) {
            if (obj2.hasOwnProperty(key)) {
                obj1[key] = obj1[key] && obj1[key].toString() === "[object Object]" ?
                    merge(obj1[key], obj2[key]) : obj1[key] = obj2[key];
            }
        }
        return obj1;

    };
    let fields: any = {};
    return {
        //deep merge
        merge,
        add: (f: any) => {
            if (typeof f === 'string') {
                fields[f] = true;
                return;
            }

            //is array
            if (Array.isArray(f)) {
                f.forEach((item) => {
                    fields[item] = true;
                })
                return;
            }

            //is object
            if (typeof f === 'object') {
                fields = merge(fields, toQuery(f));
                return;
            }


        },
        get() {
            return fields;
        }
    }
}