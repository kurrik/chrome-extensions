/*
 * Copyright (c) 2010 The Chromium Authors. All rights reserved.  Use of this
 * source code is governed by a BSD-style license that can be found in the
 * LICENSE file.
 */
var template = false;
var c = null;
var d = null;
var DISCONNECTED = document.body.DOCUMENT_POSITION_DISCONNECTED;

function waitFor(node, selector, callback, remove) {
  var handle = 'listener-' + selector.replace(/[.#\[\] "']/g, '-');
  node[handle] = function(evt) {
    var target = node.querySelector(selector);
    if (target) {
      if (remove) {
        node.removeEventListener('DOMNodeInserted', node[handle], false);
      }
      callback(target);
    }
  };
  node.addEventListener('DOMNodeInserted', node[handle], false);
};

function onNodes() {
  var isDisconnected = c.compareDocumentPosition(d) & DISCONNECTED;
  if (c && d && !isDisconnected) {
    console.log('onNodes', c, d);
    var select = c.querySelector('select');
    if (select) {
      select.addEventListener('change', function() {
        var text = this.item(this.selectedIndex).innerText;
        if (text == template.calendar) {
          var textarea = d.querySelector('textarea');
          if (textarea.value == '') {
            textarea.value = template.template;
          }
        }
      }, false);
    }
  }
};

chrome.extension.sendRequest({get: "template"}, function(response) {
  template = JSON.parse(response.template);
  waitFor(document.body, '.ep-dp-calendar', function(node) {
    if (c != node) {
      c = node;
      onNodes();
    }
  }, false);
  waitFor(document.body, '.ep-dp-descript', function(node) {
    if (d != node) {
      d = node;
      onNodes();
    }
  }, false);
});
