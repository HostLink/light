export default (): string => {

    if (localStorage.getItem("light-api-url") === null) { // if the url is not set
        return "/api/";
    }
    else {
        return localStorage.getItem("light-api-url") as string;
    }
}