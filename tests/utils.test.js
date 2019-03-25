// import BuildEmptySettings from '../Scripts/util';
const {BuildEmptySettings, checkPageIsHandled} = require('../Scripts/utils');

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


test('CheckPageIsHandled negative test', () => {
  let actual = checkPageIsHandled('http://www.google.com');
  let expected = false;
  expect(expected).toBe(actual);
});

test('CheckPageIsHandled positive test', () => {
  let actual = checkPageIsHandled('https://www.npmjs.com/');
  let expected = true;
  expect(expected).toBe(actual);
});