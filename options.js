window.onload = function(){
  console.log('window.onload');
  message('');
  load_data();
  
  // document.getElementById('url').focus();
  document.getElementById('cancel').onclick=function(){
    var ok = true;
    if(ok){
      window.close();
    }
  }
  document.getElementById('login').onclick=function(){
    login()
  }
  document.getElementById('save').onclick=function(){
    saveForm()
  }
}

function message(strMessage){
  let msg = document.getElementById('error')
  msg.innerHTML = strMessage;
}




function saveForm(){
  var url = document.getElementById('url').value;
  var username = document.getElementById('username').value;
  var password = document.getElementById('password').value;
  var app = document.getElementById('appId').value;
  
  // console.log(url);
  // console.log(username);
  // console.log(password);
  if (url === '' || username === '' || password === '' || app === ''){
    message('Please fill in all options above before saving');
    return;
  }
  var appValues = app.split(' ');
  var appInternalId = appValues[0]
  var appId = appValues[1]
  console.log('appValues', appValues, appInternalId)
  //alert(value);
  chrome.storage.sync.set({'url':url}, function(){
      //alert('saved'+ value);
  });
  chrome.storage.sync.set({'username':username}, function(){
    //alert('saved'+ value);
  });
  chrome.storage.sync.set({'password':password}, function(){
    //alert('saved'+ value);
  });
  chrome.storage.sync.set({'appId':appId}, function(){
    //alert('saved'+ value);
    console.log('Saved appId', appId)
  });
  chrome.storage.sync.set({'appInternalId':appInternalId}, function(){
    //alert('saved'+ value);
    console.log('Saved appInternalId', appInternalId)
  });
  

  var ok = true;
  if(ok){
    message('Saved Values');
    
    
    // window.close();
  }
  // load_data();
};

function login(){
  var url = document.getElementById('url').value;
  var username = document.getElementById('username').value;
  var password = document.getElementById('password').value;
  
  if (url === '' || username === '' || password === ''){
    message('Please provide URL, UserName and Password');
  }
  else {
    var app = document.getElementById('appId').value;
    var appValues = app.split(' ');
    var appInternalId = appValues[0]
    var appId = appValues[1]
    addPerms(url);
    canLogin(url, username, password);
    addApps(url, username, password, appId, appInternalId);
  }
};
function addPerms(url){
  return;
  console.log('addPerms(url)', url)
  chrome.permissions.request({
    permissions: ['tabs'],
    origins: ["*://*/*"]
  }, function(granted) {
    if (granted) {
      // The permissions have been removed.
      console.log('granted')
    } else {
      // The permissions have not been removed (e.g., you tried to remove
      // required permissions).
    }
  });
}
function canLogin(url, username, password){
  console.log('canLogin', url, username, password)
  message('');
  let baseURL = url + (url.substr(-1) ===  '/' ? '' : '/') 
  let urlEndPoint = baseURL + 'rest/user/session';
  chrome.cookies.remove({url: url, name: "CLMSESSIONID"});  
  axios
    .get(urlEndPoint, {
      auth: {
        username: username,
        password: password
      }
    })
    .then(data=> {
        console.log('Logged in');
        message("Login successful");
      })
    .catch(error => {
      console.error(error)
      message(error);
    })
};

function addApps(url, username, password, appId, appInternalId){
  console.log('addApps', appId, appInternalId)
  console.log(url, username, password)
  let baseURL = url + (url.substr(-1) ===  '/' ? '' : '/') 
  let urlListApp = baseURL + 'rest/integration/applications?goal=EVALUATE_COMPONENT'
  chrome.cookies.remove({url: url, name: "CLMSESSIONID"});  
  axios
    .get(urlListApp, {
      auth: {
        username: username,
        password: password
      }
    })
    .then(data=> {
        console.log(data.data.applicationSummaries)
        let apps =  data.data.applicationSummaries
        let i = 1;
        apps.forEach(element => {
          $('#appId').append($('<option>' , {value:element.id + ' ' + element.publicId, text:element.name}));  
          
        });     
        $("#appId").val(appInternalId + ' ' + appId);  
        // $("#appId").disabled=false; 
        document.getElementById("appId").disabled = false;    
        // console.log($("#appId").value)
        message("Login successful");
      })
    .catch(appError => {
      console.error(appError)
      message(appError);
    })
};




function load_data(){
  console.log('load_data');
  let canLogin = true;
  let url, username, password, appId, appInternalId
  chrome.storage.sync.get(['url', 'username', 'password', 'appId', 'appInternalId'], function(data){
    console.log('data', data);
    if(typeof data.url === "undefined" || typeof data.username === "undefined" || typeof data.password === "undefined"){
      canLogin = false;
    }else{
      url = data.url;
      document.getElementById("url").value = url;    
      username = data.username;
      document.getElementById("username").value = username;
      password =  data.password;
      document.getElementById("password").value = password;
      appId = data.appId;        
      appInternalId = data.appInternalId;
      console.log('canLogin', canLogin)
      //Appid is a selection? maybe should just be a free text box
      //Need to login to get the list of apps
      if (canLogin){
        document.getElementById("appId").disabled = false;
        addPerms(url);
        addApps(url, username, password, appId, appInternalId)
        // document.getElementById("appId").selectedIndex = i;
        //document.getElementById("appId").selected = appId;
        $("#appId").val(appInternalId + ' ' + appId);
      }
      console.log( appInternalId, appId);
    
    }
  });
};