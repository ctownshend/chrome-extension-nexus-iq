// import BuildEmptySettings from '../Scripts/util';
const {
  BuildEmptySettings, 
  checkPageIsHandled,
  NexusFormatMaven
} = require('../Scripts/utils');

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


test('Check NexusFormatMaven positive test', () => {
  let artifact = {
    format: "npm", 
    groupId: "commons-collections", 
    artifactId: "commons-collections",  
    version: "3.2.1", 
    extension: "jar"
  }
  let actual = NexusFormatMaven(artifact);
  let expected = {
    "components":[	
      component = {
        "hash": null, 
        "componentIdentifier": 
          {
          "format": artifact.format,
          "coordinates" : 
            {
              "groupId": artifact.groupId, 
              "artifactId": artifact.artifactId, 
                          "version" : artifact.version,
                          'extension': artifact.extension
            }
          }
        }
      ]
    };
  expect(expected).toEqual(actual);
});