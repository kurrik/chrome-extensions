/*
 * Copyright (c) 2010 The Chromium Authors. All rights reserved.  Use of this
 * source code is governed by a BSD-style license that can be found in the
 * LICENSE file.
 */
var dom_script = document.createElement('script');
dom_script.id = 'dom-jquery-script'
dom_script.addEventListener('jqueryVersion', function(evt) {
  console.log('Got event from page JS', evt);
  var str = this.innerText;  // Contents of script block are set to version.
  chrome.extension.sendRequest(str);
});

dom_script.innerText = [
  'var jqueryEvent = document.createEvent("Event");',
  'jqueryEvent.initEvent("jqueryVersion", true, true);',
  'var jqueryBlock = document.getElementById("dom-jquery-script");',
  'jqueryBlock.innerText = window.hasOwnProperty("jQuery") && jQuery.fn.jquery || "Could not find jQuery!";',
  'jqueryBlock.dispatchEvent(jqueryEvent);'
].join('\n');
  
document.body.appendChild(dom_script);
