console.log('background.js');
chrome.runtime.onMessage.addListener(gotMessage);
window.serverBaseURL = ""
window.username = ""
window.password = ""
window.haveLoggedIn = false
const messageType = {
    login: "login",
    evaluate: "evaluate",
    loggedIn:"loggedIn",
    displayMessage: "displayMessage",
    loginFailedMessage: "loginFailedMessage",
    beginevaluate: "beginevaluate",
    package: "package"
};

var formats = {
    maven: "maven",
    npm: "npm",
    nuget: "nuget",
    gem: "gem",
    pypi: "pypi"
}


// getActiveTab();

function gotMessage(message, sender, sendResponse){
    
    console.log('gotMessage');
    console.log(message);
    var settings;
    var retval;
    var baseURL, username, password;
    var package;
    console.log('message')
    console.log(message)
    switch (message.messagetype){
        case messageType.login:
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
        case messageType.evaluate:
            //evaluate
            package = message.package;
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
            // retval = evaluate(package, settings);
            // retval = evaluate2(package, settings);
            retval = loadSettingsAndEvaluate(package);
            break;
        case messageType.displayMessage:            
            //display message
            //this needs to be ignored in the background.js
            //because it is for the popup only to display
            console.log('background display message message');
            break;
        case messageType.package:            
            //display message
            //this needs to be ignored in the background.js
            //because it is for the popup only to display
            console.log('background package message does not need to respond');
            break;
        default:
            console.log('unhandled message.messagetype');
            console.log(message);
            // alert('unhandled case');

    }
    sendResponse({complete: true});
    
}

function loadSettingsAndEvaluate(package){
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
                messageType: messageType.loginFailedMessage,
                message: {response:"no Login Settings have been saved yet. Go to the options page."},
                package: package
            }
            console.log('sendmessage');
            console.log(errorMessage);
            chrome.runtime.sendMessage(errorMessage);
            
        }else{
            settings = BuildSettings(baseURL, username, password);
            retval = evaluate(package, settings);
        }
        console.log("settings:");
        console.log(settings);        
        return settings;
    });    
};

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
}

function login(settings){
    console.log("login");
    console.log(settings.auth);
    var retVal;
    // var retVal = {error: false, response: 'ok'};
    // let loggedInMessage = {
    //     messageType: messageType.loggedIn,
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
            // let retval = evaluate(package, settings);
            console.log(retVal);
            if (retVal.error){
                console.log('we got some error');
            }else{
                console.log('happy days');
            }
            let loggedInMessage = {
                messageType: messageType.loggedIn,
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
            messageType: messageType.loginFailedMessage,
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
function zzevaluate2(package, settings){
    let inputJSON = NexusFormatNPM(package)
    const url = settings.url;
    console.log(settings.auth);
    fetch(url, {
        method : "POST",
        mode: "no-cors", //"same-origin", //cors", // no-cors, cors, 
        // cache: "no-cache",
        // credentials: "same-origin", // include, *same-origin, omit
        credentials: "same-origin", 
        headers: {
            "Content-Type": "application/json",
            // "Content-Type": "application/x-www-form-urlencoded",
            'Authorization': settings.auth,
        },
        body: JSON.stringify(inputJSON),
        // -- or --
        // body : JSON.stringify({
            // user : document.getElementById('user').value,
            // ...
        // })
    }).then(
        response => response.text() // .json(), etc.
        // same as function(response) {return response.text();}
    ).then(
        html => console.log(html)
    );
}

function evaluate(package, settings){
    console.log('evaluate');
    console.log(package)
    console.log(settings)
    removeCookies(settings);
    callIQ(package, settings);
}

function removeCookies(settings){
    //settings.url = http://iq-server:8070/
    let leftPart = settings.url.search('//')+2;
    let rightPart = settings.url.search(leftPart, ':')-1;
    if (settings.url.search(leftPart+2, ':') <0){
        rightPart = settings.url.search(leftPart, '/')-1;
        if (rightPart <0){
            rightPart = settings.url.length;
        }
    }else{
        rightPart = settings.url.search(leftPart, ':')-1;
    }
    //".iq-server"
    let domain = "." + settings.url.substring(leftPart, rightPart);
    chrome.cookies.getAll({domain: domain}, function(cookies) {
        console.log('here');
        for(var i=0; i<cookies.length;i++) {
          console.log(cookies[i]);
    
          chrome.cookies.remove({url: settings.url, name: cookies[i].name});
        }
      });
    // chrome.cookies.remove({url: settings.url, name: "CLMSESSIONID"});  
}

function callIQ(package, settings){
    console.log("evaluate");
    console.log(settings.auth);
    console.log(package);
    let format = package.format;
    switch (format){
        case formats.npm:
            requestdata = NexusFormatNPM(package);
            break;
        case formats.maven:
            requestdata = NexusFormatMaven(package);
            break;
        case formats.gem:
            requestdata = NexusFormatRuby(package);
            break;
        case formats.pypi:
            requestdata = NexusFormatPyPI(package);
            break;
        case formats.nuget:
            requestdata = NexusFormatNuget(package);
            break;
        default:
            return;
            break;
    }
    
    
    let inputStr = JSON.stringify(requestdata);
    var retVal
    console.log(inputStr);
    

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
                // error = 0
                // response = xhr.responseText
            } else {
                console.log(xhr.statusText);
                // error = xhr.status;
                //response = xhr.statusText;
            }
            let response = JSON.parse(xhr.responseText);
            retVal = {error: xhr.status!==200, response: response};
            // return
            // let retval = evaluate(package, settings);
            console.log(retVal);
            if (retVal.error){
                console.log('we got some error');
            }else{
                console.log('happy days');
            }
            let displayMessage = {
                messageType: messageType.displayMessage,
                message: retVal,
                package: package
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
            messageType: messageType.displayMessage,
            message: retVal,
            package: package
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
  
function DefaultSettings(){
    console.log("DefaultSettings:");
    var username = "admin"
    var password = "admin123";
    var url = "http://localhost:8011/"    
  
      //alert(value);
    chrome.storage.sync.set({'url':url}, function(){
        //alert('saved'+ value);
        chrome.storage.sync.set({'username':username}, function(){
          //alert('saved'+ value);
          chrome.storage.sync.set({'password':password}, function(){
            //alert('saved'+ value);
          });
        });    
    });
    let settings = BuildSettings(url, username, password);
    return settings;
};

function NexusFormatNPM(package){  
	//return a dictionary in Nexus Format
    //return dictionary of components
    componentDict = {"components":[	
        component = {
            "hash": null, 
            "componentIdentifier": 
                {
                "format": package.format,
                "coordinates" : 
                    {
                        "packageId": package.packageName, 
                        "version" : package.version
                    }
                }
          }
        ]
    }
	return componentDict
};

function NexusFormatNuget(package){
	//return a dictionary in Nexus Format ofr Nuget
    //return dictionary of components
    componentDict = {
        "components":[
            component = {
                "hash": null, 
                "componentIdentifier": {
                    "format": package.format,
                    "coordinates" : {
                        "packageId": package.packageId, 
                        "version" : package.version
                        }
                    }
                }
            ]
        }
	return componentDict
}

function NexusFormatRuby(package){
	//return a dictionary in Nexus Format
    //return dictionary of components
    //TODO: how to determine the qualifier and the extension??
    componentDict = {"components":[	
		component = {
			"hash": null, 
			"componentIdentifier": 
				{
				"format": package.format,
				"coordinates" : 
					{
                    "name": package.name, 
                    "version" : package.version
					}
				}
      }
    ]
  }
	return componentDict
}

function NexusFormatPyPI(package){
	//return a dictionary in Nexus Format
    //return dictionary of components
    //TODO: how to determine the qualifier and the extension??
    componentDict = {"components":[	

            component = {
                "hash": null, 
                "componentIdentifier": 
                    {
                    "format": package.format,
                    "coordinates" : 
                        {
                            "name": package.name, 
                            "qualifier": 'py2.py3-none-any',
                            "version" : package.version,
                            "extension" : 'whl'
                        }
                    }
            }
        ]
    }
	return componentDict
}

function NexusFormatMaven(package){  
	//return a dictionary in Nexus Format
    //return dictionary of components
    componentDict = {"components":[	
		component = {
			"hash": null, 
			"componentIdentifier": 
				{
				"format": package.format,
				"coordinates" : 
					{
						"groupId": package.groupId, 
						"artifactId": package.artifactId, 
                        "version" : package.version,
                        'extension': package.extension
					}
				}
      }
    ]
  }
	return componentDict
}

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
        })
        ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
      }]);
    });
  });