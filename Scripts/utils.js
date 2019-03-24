
function BuildEmptySettings(){
    let settings = {
        username : "",
        password : "",
        tok : "",
        hash : "",
        auth : "",
        restEndPoint : "",
        baseURL : "",
        url : "",
        loginEndPoint: "",
        loginurl: ""
    }
    return settings;
}
if (typeof module !== "undefined"){
    module.exports = BuildEmptySettings;
}