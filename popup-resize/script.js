var details = {
  'relativeTo' : document.getElementsByTagName('body')[0]
};
chrome.experimental.popup.show("popup.html", details, callback);