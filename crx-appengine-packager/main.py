#!/usr/bin/env python
#
# Copyright 2010 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
import crx
import os

class MainHandler(webapp.RequestHandler):
  def get(self):
    self.response.out.write('Download the <a href="extension.crx">'
                            'packaged extension</a>.')

class CrxHandler(webapp.RequestHandler):
  def get(self):
    zipper = crx.Zipper()
    packager = crx.Packager()
    key = crx.SigningKey.getOrCreate()
    base_dir = os.path.realpath(os.path.dirname(__file__))
    extension_dir = os.path.join(base_dir, "extension-dir")
    extension = packager.package(zipper.zip(extension_dir), key)
    self.response.headers['Content-Type'] = 'application/x-chrome-extension'
    self.response.out.write(extension)

def main():
  application = webapp.WSGIApplication([
    ('/', MainHandler),
    ('/extension\.crx', CrxHandler),
  ], debug=True)
  util.run_wsgi_app(application)


if __name__ == '__main__':
    main()
