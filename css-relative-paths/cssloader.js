chrome.extension.sendRequest({method: 'getCSS'}, function(response) {
  console.log(response);
  var css = document.createElement('style'); css.innerText = response;
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(css, s);
});
