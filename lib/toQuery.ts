import { Fields } from ".";
const toJson = (query: Fields) => {

    let q: any = {};

    if (typeof query == "string") {
        q[query] = true;
        return q;
    }

    if (query instanceof Array) {
        query.forEach((subField: any) => {
            Object.entries(toJson(subField)).forEach(([subKey, subValue]) => {
                q[subKey] = subValue;
            })
        });
        return q;
    }

    Object.entries(query).forEach(([key, value]) => {
        if (key == "__args" || key == "__aliasFor" || key == "__variables" || key == "__directives" || key == "__all_on" || key == "__name") {
            q[key] = value;
            return;
        }

        if (typeof value == "boolean") {
            q[key] = value;
            return;
        }
        q[key] = toJson(value);

    });

    return q;
}

export default (query: Fields) => {
    return toJson(query)
}