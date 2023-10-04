const toJson = function (obj: object) {
    let q: any = {};
    Object.entries(obj).forEach(([key, value]) => {
        if (key == "__args") {
            q[key] = value;
            return;
        }

        if (value instanceof Array) {
            q[key] = {};
            value.forEach((subField: any) => {
                if (subField instanceof Object) {
                    Object.entries(toJson(subField)).forEach(([subKey, subValue]) => {
                        q[key][subKey] = subValue;
                    });
                    // q[key] = mapping(subField);
                } else {
                    q[key][subField] = true;

                }

            });
        } else {
            q[key] = toJson(value);
        }
    });
    return q;
}

export default (query: any) => {
    return toJson(query)
}