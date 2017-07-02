# think-payload
[![npm](https://img.shields.io/npm/v/think-payload.svg)](https://www.npmjs.com/package/think-payload)
[![Build Status](https://travis-ci.org/thinkjs/think-payload.svg?branch=master)](https://travis-ci.org/thinkjs/think-payload)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-payload/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-payload?branch=master)

Payload for Thinkjs 3.0

## Install

```
$ npm install think-payload --save
```

## Usage
config file `src/config/middleware.js`

```javascript
const payload = require('think-payload');

module.exports = [{
  handle: payload,
  options: {}
}]
```

### Data in Controller

```javascript
this.ctx.body = this.ctx.request.body
```

#### this.ctx.request.body

- **post:** the parsed body will store in `post`, if nothing was parsed, body will be an empty object {}
- **file:** the parsed file will store in `file`
  - **[key-name]** 
    - **size:** file size
    - **path:** file path
    - **name:** file name
    - **type:** file type
    - **mtime:** File upload time

### Options

- **limit:** The byte limit of the body.
  This is the number of bytes or any string format supported by
  [bytes](https://www.npmjs.com/package/bytes),
  for example `1000`, `'500kb'` or `'3mb'`.
  If the body ends up being larger than this limit,
  a `413` error code is returned.
- **encoding:** The encoding to use to decode the body into a string.
  By default, a `Buffer` instance will be returned when no encoding is specified.
  Most likely, you want `utf-8`, so setting `encoding` to `true` will decode as `utf-8`.
  You can use any type of encoding supported by [iconv-lite](https://www.npmjs.org/package/iconv-lite#readme).
- **keepExtensions:** If you want the files written to form.uploadDir to include the extensions of the original files, set this property to true.
- **uploadDir:** Sets the directory for placing file uploads in. You can move them later on using fs.rename(). The default is os.tmpdir().
- **hash:** If you want checksums calculated for incoming files, set this to either 'sha1' or 'md5'.
- **extendTypes:** support extend types:

  ```javascript
  const payload = require('think-payload');

  module.exports = [{
    handle: payload,
    options: {
      extendTypes: {
        json: ['application/x-javascript'], // will parse application/x-javascript type body in the same way as JSON type
        form: ['application/thinkjs-form'], // will parse application/thinkjs-form type body in the same way as form type
        text: ['application/thinkjs-text'], // will parse application/thinkjs-text type body in the same way as text type
        multipart: ['application/thinkjs-multipart'], // will parse application/thinkjs-multipart type body in the same way as multipart-form type
        xml: ['application/thinkjs-xml'], // will parse application/thinkjs-xml type body in the same way as xml type
      }
    }
  }]
  ```

### Errors
This module creates errors depending on the error condition during reading. The error may be an error from the underlying Node.js implementation, but is otherwise an error created by this module, which has the following attributes:

- `limit` - the limit in bytes
- `length` and `expected` - the expected length of the stream
- `message` error message
- `received` - the received bytes
- `encoding` - the invalid encoding
- `status` and `statusCode` - the corresponding status code for the error
- `type` - the error type

#### Types
The errors from this module have a type property which allows for the progamatic determination of the type of error returned.

**encoding.unsupported**

This error will occur when the encoding option is specified, but the value does not map to an encoding supported by the iconv-lite module.

**entity.too.large**

This error will occur when the limit option is specified, but the stream has an entity that is larger.

**request.aborted**

This error will occur when the request stream is aborted by the client before reading the body has finished.

**request.size.invalid**

This error will occur when the length option is specified, but the stream has emitted more bytes.

**stream.encoding.set**

This error will occur when the given stream has an encoding set on it, making it a decoded stream. The stream should not have an encoding set and is expected to emit Buffer objects.