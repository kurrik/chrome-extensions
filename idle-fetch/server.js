/*
* Copyright (c) 2010 The Chromium Authors. All rights reserved.  Use of this
* source code is governed by a BSD-style license that can be found in the
* LICENSE file.
 */

// Dependencies
var http = require('http');
var url = require('url');
var mime = require('mime');

// Server globals
var host = 'localhost';
var port = 5103;

// Create content server
function ContentServer() {
  this.server = http.createServer(this.onRequest.bind(this));
  this.server.listen(port, host);
  this.started = new Date().getTime();
};

ContentServer.prototype.onRequest = function(req, res) {
  var elapsed = new Date().getTime() - this.started;
  console.log(req.url, Math.round(elapsed / 1000));
  res.writeHead(200);
  res.write('OK');
  res.end();
};

var cs = new ContentServer();
console.log('Started server on ' + host + ':' + port);