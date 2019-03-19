console.log('contentscript.js');
var formats = {
  maven: "maven",
  npm: "npm",
  nuget: "nuget",
  gem: "gem",
  pypi: "pypi"
}

chrome.runtime.onMessage.addListener(gotMessage);
var messageType = {
    login: "login",
    evaluate: "evaluate",
    loggedIn:"loggedIn",
    displayMessage: "displayMessage",
    loginFailedMessage: "loginFailedMessage",
    beginevaluate: "beginevaluate",
    package: "package"

};
function gotMessage(message, sender, sendResponse){
    console.log('gotMessage');
    console.log(message);
    //please tell what is my url and what is my content
    console.log("url");
    var url  = window.location.href;     
    console.log(url);
    let requestmessage = ParsePage()
    //{messageType: "package", payload: package};
    let format = requestmessage.payload.format;
    let package = requestmessage.payload;
    
   
    // console.log('found');
    // console.log(found);
    
    let evaluatemessage = {
        package: package,        
        messagetype: messageType.evaluate
    }
    chrome.runtime.sendMessage(evaluatemessage);
    // let version = $("h1.package-name-redundant").innerText
    // console.log("version");
    // console.log(version);
}



///////////////////////PASTED


function ParsePage(){
    //returns message in format like this {messageType: "package", payload: package};
    //package varies depending on eco-system
    console.log('ParsePage');
    //who I am what is my address?
    var package;
    let format;
    let url = location.href; //'https://www.npmjs.com/package/lodash';
    console.log(url);
    if (url.search('search.maven.org/artifact/') >=0){
      format = formats.maven;
      package = parseMaven(format, url);

    }
    //https://mvnrepository.com/artifact/commons-collections/commons-collections/3.2.1
    if (url.search('https://mvnrepository.com/artifact/') >=0){
      format = formats.maven;
      package = parseMaven(format, url);

    }

    if (url.search('www.npmjs.com/package/') >= 0){
      //'https://www.npmjs.com/package/lodash'};
      format = formats.npm;
      package = parseNPM(format, url);
    }
    if (url.search('nuget.org/packages/') >=0){
      //https://www.nuget.org/packages/LibGit2Sharp/0.1.0
      format = formats.nuget;
      package =  parseNuget(format, url);

    }    
    
    if (url.search('pypi.org/project/') >=0){
      //https://pypi.org/project/Django/1.6/
      format = formats.pypi;
      package = parsePyPI(format, url);

    }
    
    if (url.search('rubygems.org/gems/') >=0){
      //https://rubygems.org/gems/bundler/versions/1.16.1
      format = formats.gem;
      package = parseRuby(format, url);

    }
    
    console.log("ParsePage Complete");
    console.log(package);
    //now we write this to background as
    //we pass variables through background
    message = {messageType: messageType.package, payload: package};
    chrome.runtime.sendMessage(message, function(response){
        //sends a message to background handler
        //what should I do with the callback?
        console.log('chrome.runtime.sendMessage');
        console.log(response);
        console.log(message);
    });
    return message;
};


function parseNPM(format, url) {
    //ADD SIMPLE CODE THAT CHECLS THE URL?
    //note that this changed as of 19/03/19
    var doc = $('html')[0].outerHTML
    var docelements = $(doc);

    var found = $('h1.package-name-redundant', doc);
    let newV = found.text().trim();
    console.log("newV");
    console.log(newV);
    //  
    let elements = newV.split(' ');   
    packageName = elements[0].trim();
    //  packageName=url.substr(url.lastIndexOf('/')+1);
    packageName = encodeURIComponent(packageName);
    version = elements[1].trim();
    version = version.substr(1); //drop the v
    version = encodeURIComponent(version);
    
    return {format:format, packageName:packageName, version:version}
};



  
function parseMaven(format, url) {
  console.log('parseMaven')
    //old format below
    //for now we have to parse the URL, I cant get the page source??
    //it's in an iframe
    //https://search.maven.org/#artifactdetails%7Ccommons-collections%7Ccommons-collections%7C3.2.1%7Cjar
    //new format here
    
    //maven repo https://mvnrepository.com/artifact/commons-collections/commons-collections/3.2.1
    var elements = url.split('/')
    groupId = elements[4];
    //  packageName=url.substr(url.lastIndexOf('/')+1);
    groupId = encodeURIComponent(groupId);
    artifactId = elements[5];
    artifactId = encodeURIComponent(artifactId);
  
    version = elements[6];
    version = encodeURIComponent(version);
    
    extension = elements[7];
    if (typeof extension === "undefined"){
      //mvnrepository doesnt have it
      extension = "jar"
    }
    extension = encodeURIComponent(extension);
  
    return {format: format, groupId:groupId, artifactId:artifactId, version:version, extension: extension}
};
  
function parsePyPI(format, url) {
    console.log('parsePyPI');
    //https://pypi.org/project/Django/1.6/
    //https://pypi.org/project/Django/
    var elements = url.split('/')
    if (elements[5]==""){
      //then we will try to parse
      //#content > section.banner > div > div.package-header__left > h1
      //Says Django 2.0.5
      name = elements[4];
      versionHTML = $("h1.package-header__name").text().trim();
      console.log('versionHTML');
      console.log(versionHTML);
      var elements = versionHTML.split(' ');
      version = elements[1];
      console.log(version);
    }
    else{
      name = elements[4];
      //  packageName=url.substr(url.lastIndexOf('/')+1);    
      version = elements[5];
    }
    name = encodeURIComponent(name);
    version = encodeURIComponent(version);

    return {format: format, name:name, version:version}
};
  
  
  
  
function parseNuget(format, url) {
    //for now we have to parse the URL, I cant get the page source??
    //it's in an iframe
    //https://www.nuget.org/packages/LibGit2Sharp/0.1.0
    var elements = url.split('/')
    if(elements[5]==""){
      //we are on the latest version - no version in the url
      //https://www.nuget.org/packages/LibGit2Sharp/
      packageId = elements[4];
      version = $(".package-title .text-nowrap").text();
    }
    else{
      packageId = elements[4];
      //  packageName=url.substr(url.lastIndexOf('/')+1);
      version = elements[5];
    }
    packageId = encodeURIComponent(packageId);
    version = encodeURIComponent(version);
    return {format: format, packageId:packageId, version:version}
};
  
function parseRuby(format, url) {
    //for now we have to parse the URL, I cant get the page source??
    //it's in an iframe
    console.log('parseRuby');
    var elements = url.split('/')
    if (elements.length < 6){
      //current version is inside the dom
      //https://rubygems.org/gems/bundler
      name = elements[4];
      versionHTML = $("i.page__subheading").text();
      console.log('versionHTML');
      console.log(versionHTML);
      version=versionHTML.trim();
    }
    else{
      //https://rubygems.org/gems/bundler/versions/1.16.1
      name = elements[4];
      //  packageName=url.substr(url.lastIndexOf('/')+1);
      version = elements[6];
    }
    name = encodeURIComponent(name);
    version = encodeURIComponent(version);
    return {format: format, name:name, version:version}
  };
///////////////////////END PASTED