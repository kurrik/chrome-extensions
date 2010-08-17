/*
 * Copyright (c) 2010 The Chromium Authors. All rights reserved.  Use of this
 * source code is governed by a BSD-style license that can be found in the
 * LICENSE file.
 */
var selection = window.getSelection();
// Only works with a single range 
var range = selection.getRangeAt(0);
var container = range.commonAncestorContainer;

var payload = {
  'text': selection.toString(),
  'html': container.innerHTML
};

chrome.extension.sendRequest(payload); 