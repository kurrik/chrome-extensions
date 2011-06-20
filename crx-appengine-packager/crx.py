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

import StringIO
import os
import hashlib
import zipfile
import struct
import pickle

from pyasn1.codec.der import encoder
from pyasn1.type import univ
from Crypto.PublicKey import RSA

from google.appengine.ext import db

class Zipper(object):
  """ Handles creating zip files. """
  
  def zip(self, path):
    """ Returns the contents of a path as a binary string reprentation of a 
    zip file."""
    zip_buffer = StringIO.StringIO()
    zip_file = zipfile.ZipFile(zip_buffer, 'w')
    try:
      for root, dirs, files in os.walk(path):
        for file in files:  
          # Absolute path to the file to be added.
          abspath = os.path.realpath(os.path.join(root, file))
          # Write a relative path into the zip file.
          relpath = abspath.replace(path + '/', "")
          zip_file.write(abspath, relpath)
    except RuntimeError, msg:
      raise Exception("Could not write zip!")
    finally:
      zip_file.close()
    zip_string = zip_buffer.getvalue()
    return zip_string


class SigningKey(db.Model):
  """ Represents an RSA key that can be used to sign an extension.
  
  The first time getOrCreate is called, a new key is generated and stored in
  the data store.  Subsequent calls will return the original key."""
  
  blob = db.BlobProperty()
    
  def toBitString_(self, num):
    """ Converts a long into the bit string. """
    buf = ''
    while num > 1:
      buf = str(num & 1) + buf
      num = num >> 1
    buf = str(num) + buf
    return buf

  def getRSAKey(self):
    """ Gets a data structure representing an RSA public+private key. """
    return pickle.loads(self.blob)
    
  def getRSAPublicKey(self):
    """ Gets an ASN.1-encoded form of this RSA key's public key. """
    # Get a RSAPublicKey structure
    pkinfo = univ.Sequence()
    rsakey = self.getRSAKey()
    pkinfo.setComponentByPosition(0, univ.Integer(rsakey.n))
    pkinfo.setComponentByPosition(1, univ.Integer(rsakey.e))
    
    # Encode the public key info as a bit string
    pklong = long(encoder.encode(pkinfo).encode('hex'), 16)
    pkbitstring = univ.BitString("'00%s'B" % self.toBitString_(pklong))

    # Get the rsaEncryption identifier:
    idrsaencryption = univ.ObjectIdentifier('1.2.840.113549.1.1.1')

    # Get the AlgorithmIdentifier for rsaEncryption
    idinfo = univ.Sequence()
    idinfo.setComponentByPosition(0, idrsaencryption)
    idinfo.setComponentByPosition(1, univ.Null(''))

    # Get the SubjectPublicKeyInfo structure
    publickeyinfo = univ.Sequence()
    publickeyinfo.setComponentByPosition(0, idinfo)
    publickeyinfo.setComponentByPosition(1, pkbitstring)

    # Encode the public key structure
    publickey = encoder.encode(publickeyinfo)
    return publickey
    
  @staticmethod
  def getOrCreate():
    """ Returns a signing key from the data store or creates one if it doesn't
    already exist. """
    # See if there's already a key in the datastore
    key = SigningKey.get_by_key_name('signingkey')
    if not key:
      # Create one if not
      rsakey = RSA.generate(1024, os.urandom)
      key = SigningKey(key_name='signingkey', blob=pickle.dumps(rsakey))
      # Store it for use later
      key.put()
    return key


class Packager(object):
  """ Handles creating CRX files. """
  
  def package(self, zip_string, key):
    """ Packages a zip file into a CRX, given a signing key. """
    # Obtain the hash of the zip file contents
    zip_hash = hashlib.sha1(zip_string).digest()

    # Get the SHA1 AlgorithmIdentifier
    sha1identifier = univ.ObjectIdentifier('1.3.14.3.2.26')
    sha1info = univ.Sequence()
    sha1info.setComponentByPosition(0, sha1identifier)
    sha1info.setComponentByPosition(1, univ.Null(''))

    # Get the DigestInfo sequence, composed of the SHA1 id and the zip hash
    digestinfo = univ.Sequence()
    digestinfo.setComponentByPosition(0, sha1info)
    digestinfo.setComponentByPosition(1, univ.OctetString(zip_hash))

    # Encode the sequence into ASN.1
    digest = encoder.encode(digestinfo)
    
    # Pad the hash
    paddinglength = 128 - 3 - len(digest)
    paddedhexstr = "0001%s00%s" % (paddinglength * 'ff', digest.encode('hex'))
    
    # Calculate the signature
    signature_bytes = key.getRSAKey().sign(paddedhexstr.decode('hex'), "")[0]
    signature = ('%X' % signature_bytes).decode('hex')
    
    # Get the public key
    publickey = key.getRSAPublicKey()
    
    # Write the actual CRX contents
    crx_buffer = StringIO.StringIO("wb")
    crx_buffer.write("Cr24")  # Extension file magic number, from the CRX focs
    crx_buffer.write(struct.pack('iii', 2, len(publickey), len(signature)))
    crx_buffer.write(publickey)
    crx_buffer.write(signature)
    crx_buffer.write(zip_string)
    crx_file = crx_buffer.getvalue()
    return crx_file