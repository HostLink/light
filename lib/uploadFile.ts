import { mutation } from '.';

export default async function (file: File): Promise<any> {
    return mutation("fsUploadTempFile", {
        file
    });
}
