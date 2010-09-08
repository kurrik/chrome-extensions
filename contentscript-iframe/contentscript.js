/*
 * Copyright (c) 2010 The Chromium Authors. All rights reserved.  Use of this
 * source code is governed by a BSD-style license that can be found in the
 * LICENSE file.
 */
if (window != window.top) {
  alert('In an IFRAME: ' + window.location.href);
}
