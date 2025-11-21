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
    }
    return false;
}
