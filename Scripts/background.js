console.log('background.js');
if (typeof chrome !== "undefined"){
    chrome.runtime.onMessage.addListener(gotMessage);
}
window.serverBaseURL = ""
window.username = ""
window.password = ""
window.haveLoggedIn = false
 

// getActiveTab();

function gotMessage(message, sender, sendResponse){
    
    console.log('gotMessage');
    console.log(message);
    var settings;
    var retval;
    var baseURL, username, password;
    var artifact;
    console.log('message')
    console.log(message)
    switch (message.messagetype){
        case messageTypes.login:
            //login attempt
            baseURL = message.baseURL;
            username = message.username;
            password = message.password;
            settings = BuildSettings(baseURL, username, password)
            window.baseURL = baseURL;//"http://localhost:8070/"
            window.username = username; //"admin"
            window.password = password;//"admin123"
            retval = login(settings);
            break;
        case messageTypes.evaluate:
            //evaluate
            artifact = message.artifact;
            // window.baseURL = "http://iq-server:8070/"
            // window.username = "admin"
            // window.password = "admin123"


            // baseURL = window.baseURL;//"http://localhost:8070/"
            // username = window.username; //"admin"
            // password = window.password;//"admin123"
            // settings = BuildSettings(baseURL, username, password)
            // window.baseURL = baseURL;//"http://localhost:8070/"
            // window.username = username; //"admin"
            // window.password = password;//"admin123"
            // retval = evaluate(artifact, settings);
            // retval = evaluate2(artifact, settings);
            retval = loadSettingsAndEvaluate(artifact);
            break;
        case messageTypes.displayMessage:            
            //display message
            //this needs to be ignored in the background.js
            //because it is for the popup only to display
            console.log('background display message message');
            break;
        case messageTypes.artifact:            
            //display message
            //this needs to be ignored in the background.js
            //because it is for the popup only to display
            console.log('background artifact message does not need to respond');
            break;
        default:
            console.log('unhandled message.messagetype');
            console.log(message);
            // alert('unhandled case');

    }
    sendResponse({complete: true});
    
}

function loadSettingsAndEvaluate(artifact){
    console.log('loadSettings');
  
    chrome.storage.sync.get(['url', 'username', 'password'], function(data){
        console.log("url: "+ data.url);
        console.log("username: "+ data.username);
        console.log("password: "+ data.password);
        let username = data.username;
        let password = data.password;
        let baseURL = data.url;
        let settings;
        if (!username){
            // settings = BuildEmptySettings();
            
            let errorMessage = {
                messagetype: messageTypes.loginFailedMessage,
                message: {response:"no Login Settings have been saved yet. Go to the options page."},
                artifact: artifact
            }
            console.log('sendmessage');
            console.log(errorMessage);
            chrome.runtime.sendMessage(errorMessage);
            
        }else{
            settings = BuildSettings(baseURL, username, password);
            retval = evaluate(artifact, settings);
        }
        console.log("settings:");
        console.log(settings);        
        return settings;
    });    
};


function login(settings){
    console.log("login");
    console.log(settings.auth);
    var retVal;
    // var retVal = {error: false, response: 'ok'};
    // let loggedInMessage = {
    //     messageType: messageTypes.loggedIn,
    //     message: retVal
    // }
    // chrome.runtime.sendMessage(loggedInMessage);
    // return(retVal);
    // let inputstr = 'crap'
    let xhr = new XMLHttpRequest();
    xhr.open("GET", settings.loginurl, true);
    // xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    xhr.setRequestHeader("Authorization", settings.auth);
    // xhr.withCredentials = true; 
    xhr.onload = function (e) {
        let error = 0;
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                console.log(xhr.responseText);
                // error = 0
                // response = xhr.responseText
            } else {
                console.log(xhr.statusText);
                // error = xhr.status;
                // response = xhr.statusText;
            }
            retVal = {error: xhr.status !== 200, response: xhr.responseText};
            // return
            // let retval = evaluate(artifact, settings);
            console.log(retVal);
            if (retVal.error){
                console.log('we got some error');
            }else{
                console.log('happy days');
            }
            let loggedInMessage = {
                messagetype: messageTypes.loggedIn,
                message: retVal
            }
            window.haveLoggedIn = true;
            console.log('sendmessage');
            console.log(loggedInMessage);
            chrome.runtime.sendMessage(loggedInMessage);
            return(retVal);
        }
    };
    xhr.onerror = function (e) {
        console.log(xhr);
        retVal = {error: xhr.status, response: xhr.responseText};
        let loginFailedMessage = {
            messagetype: messageTypes.loginFailedMessage,
            message: retVal,
            
        }
        chrome.runtime.sendMessage(loginFailedMessage);
        return(retVal);
    };
    // xhr.setRequestHeader("Authorization", settings.auth);
    console.log('about to send');    
    xhr.send();
    console.log('sent');    
    console.log(xhr);
    
}


function evaluate(artifact, settings){
    console.log('evaluate');
    console.log(artifact)
    console.log(settings)
    removeCookies(settings);

    // console.log(artifact.datasource)
    switch(artifact.datasource) {
        case dataSources.NEXUSIQ:
            resp = callIQ(artifact, settings);
            break;
        case dataSources.OSSINDEX:
          resp = addDataOSSIndex(artifact, settings);
          break;
        default:
          alert('Unhandled datasource' + artifact.datasource);

    }
}


function callIQ(artifact, settings){
    console.log("evaluate");
    console.log(settings.auth);
    console.log(artifact);
    let format = artifact.format;
    switch (format){
        case formats.npm:
            requestdata = NexusFormatNPM(artifact);
            break;
        case formats.maven:
            requestdata = NexusFormatMaven(artifact);
            break;
        case formats.gem:
            requestdata = NexusFormatRuby(artifact);
            break;
        case formats.pypi:
            requestdata = NexusFormatPyPI(artifact);
            break;
        case formats.nuget:
            requestdata = NexusFormatNuget(artifact);
            break;
        
        default:
            return;
            break;
    }
    
 
  
    
    let inputStr = JSON.stringify(requestdata);
    var retVal
    console.log(inputStr);
    var response

    let xhr = new XMLHttpRequest();
    let url = settings.url;
    // url.replace('http//', 'http://admin@admin123')
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    // xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    // xhr.dataType = "jsonp"
    
    // xhr.setRequestHeader("IEAuth", settings.auth);
 
    //security stopped these
    // xhr.setRequestHeader("Content-length", inputStr.length); 
    // http.setRequestHeader("Connection", "close");
    xhr.setRequestHeader("Authorization", settings.auth);
    xhr.withCredentials = true; 
    xhr.onload = function (e) {
        let error = 0;
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                console.log('xhr');
                console.log(xhr);
                
                console.log(xhr.responseText);
                error = 0
                // response = xhr.responseText
                response = JSON.parse(xhr.responseText);

            } else {
                console.log(xhr);
                error = xhr.status;
                response = xhr.responseText;
                // response: "This REST API is meant for system to system integration and can't be accessed with a web browser."
                // responseText: "This REST API is meant for system to system integration and can't be accessed with a web browser."
            }
            retVal = {error: error, response: response};
            // return
            // let retval = evaluate(artifact, settings);
            console.log(retVal);
            if (retVal.error){
                console.log('we got some error');
            }else{
                console.log('happy days');
            }
            let displayMessage = {
                messagetype: messageTypes.displayMessage,
                message: retVal,
                artifact: artifact
            }
            console.log('sendmessage');
            console.log(displayMessage);
            chrome.runtime.sendMessage(displayMessage);
            return(retVal);
        }
    };
    xhr.onerror = function (e) {
        console.log(xhr);
        //let response = JSON.parse(xhr.responseText);
        let response = {errorMessage: xhr.responseText};
        retVal = {error: xhr.status, response: response};
        let displayMessage = {
            messagetype: messageTypes.displayMessage,
            message: retVal,
            artifact: artifact
        }
        chrome.runtime.sendMessage(displayMessage);
        return(retVal);
    };
    // xhr.setRequestHeader("Authorization", settings.auth);
    console.log('about to send');    
    // xhr.send(inputStr);
    xhr.send(inputStr );
    // xhr.send();
    console.log('sent');    
    console.log(xhr);
}


function BuildSettings(baseURL, username, password){
    //let settings = {};
    console.log("BuildSettings");
    let tok = username + ':' + password;
    let hash = btoa(tok);
    let auth =  "Basic " + hash;
    let restEndPoint = "api/v2/components/details"
    if (baseURL.substring(baseURL.length-1) !== '/'){
        baseURL =baseURL + '/'
    }
    let url = baseURL + restEndPoint
    //login end point
    let loginEndPoint = "rest/user/session"
    let loginurl = baseURL + loginEndPoint
  
    //whenDone(settings);
    let settings = {
        username : username,
        password : password,
        tok : tok,
        hash : hash,
        auth : auth,
        restEndPoint : restEndPoint,
        baseURL : baseURL,
        url : url,
        loginEndPoint: loginEndPoint,
        loginurl: loginurl,
    }
    return settings;        
}; 


function getActiveTab(){
    console.log('getActiveTab');
    var tab;
    let params = {active: true, currentWindow: true}
    chrome.tabs.query(params, function(tabs) {
      var tab = tabs[0];
      console.log(tab);
      ToggleIcon(tab);

    //   let message = {
    //       messageType: "popup",
    //       payLoad: tab
    //     };
    //   console.log ('message');
    //   console.log(message);
    //   chrome.tabs.sendMessage(tab.id, message, function(response) {
    //     console.log(response);
    //   });
    });
    return (tab);
};
  
// function loadSettings(){
//     console.log('loadSettings');
  
//     chrome.storage.sync.get(['url', 'username', 'password'], function(data){
//         console.log("url: "+ data.url);
//         console.log("username: "+ data.username);
//         console.log("password: "+ data.password);
//         let username = data.username;
//         let password = data.password;
//         let baseURL = data.url;
//         let settings;
//         if (!username){
//           settings = DefaultSettings();
//         }else{
//           settings = BuildSettings(baseURL, username, password);
//         }
//         console.log("settings:");
//         console.log(settings);        
//         return settings;
//     });    
// };
  
// function DefaultSettings(){
//     console.log("DefaultSettings:");
//     var username = "admin"
//     var password = "admin123";
//     var url = "http://localhost:8011/"    
  
//       //alert(value);
//     chrome.storage.sync.set({'url':url}, function(){
//         //alert('saved'+ value);
//         chrome.storage.sync.set({'username':username}, function(){
//           //alert('saved'+ value);
//           chrome.storage.sync.set({'password':password}, function(){
//             //alert('saved'+ value);
//           });
//         });    
//     });
//     let settings = BuildSettings(url, username, password);
//     return settings;
// };


function ToggleIcon(tab){
    console.log('ToggleIcon');
    console.log(tab);
    let found = false;
    if (tab.url.indexOf('https://search.maven.org/artifact/') == 0) {
        // ... show the page action.
        found = true;
    }
    if (tab.url.indexOf('https://mvnrepository.com/artifact/') == 0) {
        // ... show the page action.
        found = true;
    }
    if (tab.url.indexOf('https://www.npmjs.com/package/') == 0) {
        // ... show the page action.
        found = true;
    }
    if (tab.url.indexOf('https://www.nuget.org/packages/') == 0) {
        // ... show the page action.
        found = true;
    }
    if (tab.url.indexOf('https://pypi.org/project/') == 0) {
        // ... show the page action.
        found = true;
    }
    if (tab.url.indexOf('https://rubygems.org/gems/') == 0) {
        // ... show the page action.
        found = true;
    }

    if (found){
        chrome.pageAction.show(tab.id);        
    }else{
        chrome.pageAction.hide(tab.id);
    }
    console.log(found);
}

function addDataOSSIndex( artifact, settings){// pass your data in method
//OSSINdex is anonymous
console.log('entering addDataOSSIndex');
var retVal; //return object including status
retVal = {error: 1002, response: "Unspecified error"};
// https://ossindex.sonatype.org/api/v3/component-report/composer%3Adrupal%2Fdrupal%405
//type:namespace/name@version?qualifiers#subpath 
var format = artifact.format;
var name = artifact.name;
var version = artifact.version;
var OSSIndexURL= "https://ossindex.sonatype.org/api/v3/component-report/" + format + '%3A'+ name + '%40' + version
var status = false;
//components[""0""].componentIdentifier.coordinates.packageId
console.log('settings');
console.log(settings);
console.log(settings.auth);
console.log("inputdata");
console.log(artifact);
console.log("OSSIndexURL");
console.log(OSSIndexURL);
inputStr=JSON.stringify(artifact);

    
if (!settings.baseURL){
    retVal = {error: 1001, response: "Problem retrieving URL"};
    console.log('no base url');
    return (retVal);
}
$.ajax({            
        type: "GET",
        // beforeSend: function (request)
        // {
        //     //request.withCredentials = true;
        //     // request.setRequestHeader("Authorization", settings.auth);
        // },            
        async: true,
        url: OSSIndexURL,
        data: inputStr,
        
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        crossDomain: true,
        success: function (responseData, status, jqXHR) {
            console.log('ajax success');
            console.log(responseData);
            status = true;
            retVal = {error: 0, response: responseData}; //no error
            //return (retVal);
            //handleResponseData(responseData);
            //alert("success");// write success in " "
            let displayMessage = {
                messagetype: messageTypes.displayMessage,
                message: retVal,
                artifact: artifact
            }
            console.log('sendmessage');
            console.log(displayMessage);
            chrome.runtime.sendMessage(displayMessage);
            return(retVal);
        },

        error: function (jqXHR, status) {
            // error handler
            console.log('some error');
            console.log(jqXHR);
            //console.log(jqXHR.responseText  + jqXHR.responseText + jqXHR.status);
            //alert('fail' + jqXHR.responseText  + '\r\n' + jqXHR.statusText + '\r\n' + 'Code:' +  jqXHR.status);
            retVal={error: 500, response: jqXHR};
            return (retVal);
        },
        timeout: 3000 // sets timeout to 3 seconds
    });

if(retVal.error == 0){
    let componentInfoData = retVal;
    console.log('retVal');
    console.log(retVal);
    var componentDetail = componentInfoData.response;
    console.log("componentInfoData");
    console.log(componentDetail);
    
    
}else{
    //an error
    console.log('an eror occurred, show the response')
    // $("#error").html(retVal.response.statusText);
    // $("#error").show(1000);
}
// window.responsedata = retVal;
return retVal;
};
 

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    //page was updated
    if (changeInfo.status == 'complete' && tab.active) {  
      // do your things
        console.log('chrome.tabs.onUpdated.addListener');
        //need to tell the content script to reevaluate
        //send a message to content.js
        ToggleIcon(tab);
    }
});
 
chrome.tabs.onActivated.addListener(function(activeInfo) {
    console.log(activeInfo.tabId);
});

chrome.runtime.onInstalled.addListener(function() {
    // loadSettings();
    // return;
    console.log('chrome.runtime.onInstalled.addListener')
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [
          //https://mvnrepository.com/artifact/commons-collections/commons-collections/3.2.1
          new chrome.declarativeContent.PageStateMatcher({  
            pageUrl: {hostEquals: 'mvnrepository.com', 
                      schemes: ['https'],
                      pathContains: "artifact"
                  },
          }),      
  
            new chrome.declarativeContent.PageStateMatcher({
          //https://search.maven.org/#artifactdetails%7Corg.apache.struts%7Cstruts2-core%7C2.3.31%7Cjar
          //bug in Chrome extensions dont handle hashes https://bugs.chromium.org/p/chromium/issues/detail?id=84024

          pageUrl: {hostEquals: 'search.maven.org', 
                    schemes: ['https'],
                    pathContains: "artifact"
                },
        }),      
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {hostEquals: 'www.npmjs.com',
                    schemes: ['https'],
                    pathContains: "package"},          
        }),
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {hostEquals: 'www.nuget.org', 
                    schemes: ['https'],
                    pathContains: "packages"}, 
        }),      
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {hostEquals: 'pypi.org', 
                    schemes: ['https'],
                    pathContains: "project"}, 
        }),
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {hostEquals: 'rubygems.org', 
                    schemes: ['https'],
                    pathContains: "gems"}, 
        }),
        //OSSINDEX
        new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {hostEquals: 'packagist.org', 
                      schemes: ['https'],
                      pathContains: "packages"}, 
          }),
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {hostEquals: 'cocoapods.org', 
                      schemes: ['https'],
                      pathContains: "pods"}, 
          })  
        ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
      }]);
    });
});

  