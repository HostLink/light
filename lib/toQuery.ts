const toJson = (query: Object | Array<string | Object | string>) => {

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
        if (key == "__args") {
            q[key] = value;
            return;
        }
        q[key] = toJson(value);

    });

    return q;
}

export default (query: Object | Array<string | Object> | string) => {
    return toJson(query)
}