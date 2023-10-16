export default (): string => {

    //check is localStorage is available
    if (typeof localStorage === 'undefined') {
        return "http://127.0.0.1:8888/api/";
    }

    if (localStorage.getItem("light-api-url") === null) { // if the url is not set
        return "/api/";
    }
    else {
        return localStorage.getItem("light-api-url") as string;
    }
}