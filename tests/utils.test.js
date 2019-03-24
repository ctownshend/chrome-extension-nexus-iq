// import BuildEmptySettings from '../Scripts/util';
const BuildEmptySettings = require('../Scripts/utils');

test('Can build empty Settings', () => {
    let actual = BuildEmptySettings();
    let expected = {
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
  expect(expected).toEqual(actual);
});