import { query } from "./"

export const granted = async (rights: string[]): Promise<string[]> => {

    const resp = await query({
        granted: {
            __args: {
                rights: rights
            },
        }
    });

    return resp.granted;

}
