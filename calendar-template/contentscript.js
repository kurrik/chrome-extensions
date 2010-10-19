/*
 * Copyright (c) 2010 The Chromium Authors. All rights reserved.  Use of this
 * source code is governed by a BSD-style license that can be found in the
 * LICENSE file.
 */

function getTextInput(evt) {
  if (evt.target.querySelector) {
    if (evt.target.nodeName == 'TEXTAREA' &&
        evt.target.classList.contains('textinput')) {
      return evt.target;
    } else {
      return evt.target.querySelector('textarea.textinput');
    }
  }
};

var template = false;

function onDomInserted(evt) {
  if (!template || template == "") {
    return;
  }
  var input = getTextInput(evt);
  if (input) {
    var parent = input.parentNode && input.parentNode.parentNode;
    if (parent && parent.classList.contains('ep-dp-descript')) {
      if (input.value == "") {
        input.value = template;
      } else if (input.value == "Click to add a description") {
        input.value = template;
        input.classList.remove('ui-placeholder');
        input.addEventListener('focus', function(evt) {
          evt.stopImmediatePropagation();
        }, true);
      }
    }
  }
};

chrome.extension.sendRequest({get: "template"}, function(response) {
  template = response.template;
  document.body.addEventListener('DOMNodeInserted', onDomInserted, false);
  console.log('Added listener');
});
