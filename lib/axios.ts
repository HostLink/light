import { AxiosInstance } from "axios";
import axios from "axios";

let localAxios: AxiosInstance;
const setAxios = (a: AxiosInstance) => {
    localAxios = a;
}

const getAxios = () => {
    if (!localAxios) {
        localAxios = axios.create({
            withCredentials: true
        });
    }

    return localAxios;
}

export {
    setAxios,
    getAxios
}


