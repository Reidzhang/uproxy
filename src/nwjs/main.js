"use strict";
// Load freedom module by loading it as exteranl module. In order to get freedom
// we has to bind a callback function while it is ready (finished loading).
function loadScript(url, callback){
    var foo1 = document.createElement('script');
    foo1.type = 'text/javascript';
    foo1.setAttribute('src', url);

    foo1.onreadystatechange = callback;
    foo1.onload = callback;

    var head = document.getElementsByTagName('head')[0];
    head.appendChild(foo1, head);
};
loadScript('./freedom-for-chrome/freedom-for-chrome.js', function(){
    var uProxyAppChannelPromise = freedom('generic_core/freedom-module.json', {
        'logger': 'lib/loggingprovider/freedom-module.json',
        'debug': 'debug',
        'portType': 'worker'
    }).then(function (uProxyModuleFactory) {
        console.log('Core loading complete');
        return uProxyModuleFactory();
    });
});
