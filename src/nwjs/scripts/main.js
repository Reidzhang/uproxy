// Load freedom module by loading it as exteranl module. In order to get freedom
// we has to bind a callback function while it is ready (finished loading).
function loadScript(url, callback){
    var source_element = document.createElement('script');
    source_element.type = 'text/javascript';
    source_element.src = url;

    source_element.onreadystatechange = callback;
    source_element.onload = callback;

    document.body.appendChild(source_element);
};

loadScript('./freedom-for-chrome/freedom-for-chrome.js', function(){
    loadScript('./scripts/main.core-env.static.js', function() {});
});
