console.log('contentscript.js');
// var formats = {
//   maven: "maven",
//   npm: "npm",
//   nuget: "nuget",
//   gem: "gem",
//   pypi: "pypi",
//   packagist: "packagist",
//   cocoapods: "cocoapods"
// }

// const dataSources = {
//   NEXUSIQ: 'NEXUSIQ',
//   OSSINDEX: 'OSSINDEX'
// }

// var messageType = {
//   login: "login",
//   evaluate: "evaluate",
//   loggedIn:"loggedIn",
//   displayMessage: "displayMessage",
//   loginFailedMessage: "loginFailedMessage",
//   beginevaluate: "beginevaluate",
//   artifact: "artifact"

// };

chrome.runtime.onMessage.addListener(gotMessage);

function gotMessage(message, sender, sendResponse){
    console.log('gotMessage');
    console.log(message);
    //please tell what is my url and what is my content
    console.log("url");
    var url  = window.location.href;     
    console.log(url);
    let requestmessage = ParsePage()
    console.log('requestmessage');
    console.log(requestmessage);
    //{messageType: "artifact", payload: artifact};
    let artifact = requestmessage.payload;
    console.log('artifact');
    console.log(artifact);
    let format = artifact.format;
    let evaluatemessage = {
        artifact: artifact,        
        messagetype: messageTypes.evaluate
    }
    chrome.runtime.sendMessage(evaluatemessage);

}



///////////////////////PASTED


function ParsePage(){
    //returns message in format like this {messageType: "artifact", payload: artifact};
    //artifact varies depending on eco-system
    console.log('ParsePage');
    //who I am what is my address?
    let artifact;
    let format;
    let datasource = dataSources.NEXUSIQ;;
    let url = location.href; //'https://www.npmjs.com/package/lodash';
    console.log(url);
    if (url.search('search.maven.org/artifact/') >=0){
      format = formats.maven;
      datasource = dataSources.NEXUSIQ;
      artifact = parseMaven(format, url);

    }
    //https://mvnrepository.com/artifact/commons-collections/commons-collections/3.2.1
    if (url.search('https://mvnrepository.com/artifact/') >=0){
      format = formats.maven;
      datasource = dataSources.NEXUSIQ;
      artifact = parseMaven(format, url);

    }

    if (url.search('www.npmjs.com/package/') >= 0){
      //'https://www.npmjs.com/package/lodash'};
      format = formats.npm;
      datasource = dataSources.NEXUSIQ;
      artifact = parseNPM(format, url);
    }
    if (url.search('nuget.org/packages/') >=0){
      //https://www.nuget.org/packages/LibGit2Sharp/0.1.0
      format = formats.nuget;
      datasource = dataSources.NEXUSIQ;
      artifact =  parseNuget(format, url);

    }    
    
    if (url.search('pypi.org/project/') >=0){
      //https://pypi.org/project/Django/1.6/
      format = formats.pypi;
      datasource = dataSources.NEXUSIQ;
      artifact = parsePyPI(format, url);

    }
    
    if (url.search('rubygems.org/gems/') >=0){
      //https://rubygems.org/gems/bundler/versions/1.16.1
      format = formats.gem;
      datasource = dataSources.NEXUSIQ;
      artifact = parseRuby(format, url);

    }
    
    //OSSIndex    
    if (url.search('packagist.org/packages/') >=0){
      //https://rubygems.org/gems/bundler/versions/1.16.1
      format = formats.packagist;
      datasource = dataSources.OSSINDEX;
      artifact = parsePackagist(format, url, datasource);

    }
    if (url.search('cocoapods.org/pods/') >=0){
      //https://rubygems.org/gems/bundler/versions/1.16.1
      format = formats.cocoapods;
      datasource = dataSources.OSSINDEX;
      artifact = parseCocoaPods(format, url, datasource);

    }

    artifact.datasource = datasource;
    console.log("ParsePage Complete");
    console.log(artifact);
    //now we write this to background as
    //we pass variables through background
    message = {
      messagetype: messageTypes.artifact,       
      payload: artifact
    };
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



function parsePackagist(format, url, datasource) {
  //server is packagist, format is composer
  console.log('parsePackagist:' +  url);
  var elements = url.split('/')
  //https://packagist.org/packages/drupal/drupal
  //Specific version is with a hash
  //https://packagist.org/packages/drupal/drupal#8.6.2
  var namePt1 = elements[4];
  var namePt2 = elements[5];
  name = namePt1 + "/" + namePt2
  var whereIs = namePt2.search("#")
  //is the version number in the URL? if so get that, else get it from the HTML
  if (whereIs > -1 ){
    version = namePt2.substr(whereIs +1)
  } else{
    //get the version from the HTML as we are on the generic page
    //#headline > div > h1 > span
    versionHTML = $("span.version-number").first().text()
    console.log('versionHTML');
    console.log(versionHTML);
    version=versionHTML.trim();
  }
  name = encodeURIComponent(name);
  version = encodeURIComponent(version);
  return {
    format: format, 
    datasource: datasource,
    name: name, 
    version: version
  }
}

  function parseCocoaPods(format, url, datasource) {
    console.log('parseCocoaPods');
    var elements = url.split('/')
    //https://cocoapods.org/pods/TestFairy
    name = elements[4];
    //#headline > div > h1 > span
    versionHTML = $("H1 span").first().text()
    console.log('versionHTML');
    console.log(versionHTML);
    version=versionHTML.trim();

    name = encodeURIComponent(name);
    version = encodeURIComponent(version);
    return {
      format: format, 
      datasource: datasource,
      name: name, 
      version: version
    }
  }