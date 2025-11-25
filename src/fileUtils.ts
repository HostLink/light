export function arrayHasFile(arr: any[]): boolean {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] instanceof File) {
            return true;
        }
    }
    return false;
}

export function objectHasFile(obj: any): boolean {
    for (let key in obj) {
        if (obj[key] instanceof File) {
            return true;
        }
        if (obj[key] instanceof Array && arrayHasFile(obj[key])) {
            return true;
        }
    }
    return false;
}


function decode_base85(a: string) {
    a = "<~" + a + "~>"

    var c, d, e, f, g, h = String, w = 255;
    for ("<~" === a.slice(0, 2) && "~>" === a.slice(-2), a = a.slice(2, -2).replace(/\s/g, "").replace("z", "!!!!!"),
        c = "uuuuu".slice(a.length % 5 || 5), a += c, e = [], f = 0, g = a.length; g > f; f += 5) d = 52200625 * (a.charCodeAt(f) - 33) + 614125 * (a.charCodeAt(f + 1) - 33) + 7225 * (a.charCodeAt(f + 2) - 33) + 85 * (a.charCodeAt(f + 3) - 33) + (a.charCodeAt(f + 4) - 33),
            e.push(w & d >> 24, w & d >> 16, w & d >> 8, w & d);
    return function (a, b) {
        for (var c = b; c > 0; c--) a.pop();
    }(e, c.length), h.fromCharCode.apply(h, e);
}

export const file = (s: string = "") => {
    const data = s;
    const getURL = (mime: string = "application/octet-stream") => {
        const uint8Array = new Uint8Array(data.length);
        for (let i = 0; i < data.length; i++) {
            uint8Array[i] = data.charCodeAt(i);
        }
        const blob = new Blob([uint8Array], { type: mime });
        const url = URL.createObjectURL(blob);
        return url;
    }

    return {
        getContent: () => data,
        getURL: getURL,
        download: (filename: string) => {
            const link = document.createElement("a");
            link.download = filename;
            link.href = getURL();

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
        open: (mime: string) => {
            window.open(getURL(mime), "_blank");
        }
    }
}

/* export const File = {
    fromBase85: (a: string) => {
        return file(decode_base85(a));
    },
    fromBase64: (a: string) => {
        return file(atob(a));

    }, fromString: (a: string) => {
        return file(a);
    }
} */