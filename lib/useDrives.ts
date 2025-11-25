import type { AxiosInstance } from 'axios';
import { query } from '.';

const listDrives = (axios: AxiosInstance) => {
    return query({
        app: {
            drives: {
                index: true,
                name: true,
            }
        }
    }).then(resp => resp.app.drives);
}

export const useDrives = (axios: AxiosInstance) => {

    return {
        list: listDrives(axios) as Promise<Array<{ index: number, name: string }>>
    };

}

export default useDrives;
