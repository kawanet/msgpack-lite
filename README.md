# msgpack-lite [![npm version](https://badge.fury.io/js/msgpack-lite.svg)](http://badge.fury.io/js/msgpack-lite) [![Build Status](https://travis-ci.org/kawanet/msgpack-lite.svg?branch=master)](https://travis-ci.org/kawanet/msgpack-lite)

Fast Pure JavaScript MessagePack Encoder and Decoder

[![Sauce Test Status](https://saucelabs.com/browser-matrix/msgpack-lite.svg)](https://saucelabs.com/u/msgpack-lite)

Online demo: [http://kawanet.github.io/msgpack-lite/](http://kawanet.github.io/msgpack-lite/)

### Features

- Pure JavaScript only (No node-gyp nor gcc required)
- Faster than any other pure JavaScript libraries: **5x faster** encoding and **50% faster** decoding
- Even faster than C++ based [msgpack](https://www.npmjs.com/package/msgpack) library: **50% faster** encoding and **10% faster** decoding
- Streaming encoding and decoding interface is also available. It's more faster.
- [Browsers](https://saucelabs.com/u/msgpack-lite) ready (Chrome, Firefox, Safari and even works on IE8)
- [Tested](https://travis-ci.org/kawanet/msgpack-lite) on Node.js-v0.12, v0.10 and io.js-v3.3 and browsers

### Encoding and Decoding MessagePack

```js
var msgpack = require("msgpack-lite");

// encode from JS Object to MessagePack (Buffer)
var buffer = msgpack.encode({"foo": "bar"});

// decode from MessagePack (Buffer) to JS Object
var data = msgpack.decode(buffer); // => {"foo": "bar"}
```

### Writing to MessagePack Stream

```js
var fs = require("fs");
var msgpack = require("msgpack-lite");

var writeStream = fs.createWriteStream("test.msp");
var encodeStream = msgpack.createEncodeStream();
encodeStream.pipe(writeStream);

// send multiple objects to stream
encodeStream.write({foo: "bar"});
encodeStream.write({baz: "qux"});
```

### Reading from MessagePack Stream

```js
var fs = require("fs");
var msgpack = require("msgpack-lite");

var readStream = fs.createReadStream("test.msp");
var decodeStream = msgpack.createDecodeStream();

// show multiple objects decoded from stream
readStream.pipe(decodeStream).on("data", console.warn);
```

### Command Line Interface

A CLI tool bin/msgpack converts data stream from JSON to MessagePack and vice versa.

```sh
$ echo '{"foo": "bar"}' | ./bin/msgpack -Jm | od -tx1
0000000    81  a3  66  6f  6f  a3  62  61  72

$ echo '{"foo": "bar"}' | ./bin/msgpack -Jm | ./bin/msgpack -Mj
{"foo":"bar"}
```

### Installation

```sh
$ npm install --save msgpack-lite
```

### Tests

Run tests on node.js:

```sh
$ make test
```

Run tests on browsers:

```sh
$ make test-browser-local
open the following url in a browser:
http://localhost:4000/__zuul
```

### Browser Build

Browser version [msgpack.min.js](https://rawgithub.com/kawanet/msgpack-lite/master/dist/msgpack.min.js) is also available. 37KB minified, 11KB gziped.

```html
<!--[if lte IE 9]>
<script src="https://cdnjs.cloudflare.com/ajax/libs/es5-shim/4.1.10/es5-shim.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/json3/3.3.2/json3.min.js"></script>
<![endif]-->
<script src="https://rawgithub.com/kawanet/msgpack-lite/master/dist/msgpack.min.js"></script>
<script>
// encode from JS Object to MessagePack (Uint8Array)
var buffer = msgpack.encode({foo: "bar"});

// decode from MessagePack (Uint8Array) to JS Object
var array = new Uint8Array([0x81, 0xA3, 0x66, 0x6F, 0x6F, 0xA3, 0x62, 0x61, 0x72]);
var data = msgpack.decode(array);
</script>
```

### Interoperability

It is tested to have basic compatibility with other Node.js MessagePack modules below:

- [https://www.npmjs.com/package/msgpack](https://www.npmjs.com/package/msgpack) (0.2.6)
- [https://www.npmjs.com/package/msgpack-js](https://www.npmjs.com/package/msgpack-js) (0.3.0)
- [https://www.npmjs.com/package/msgpack-js-v5](https://www.npmjs.com/package/msgpack-js-v5) (0.3.0-v5)
- [https://www.npmjs.com/package/msgpack5](https://www.npmjs.com/package/msgpack5) (3.1.0)
- [https://www.npmjs.com/package/msgpack-unpack](https://www.npmjs.com/package/msgpack-unpack) (2.1.1)
- [https://github.com/msgpack/msgpack-javascript](https://github.com/msgpack/msgpack-javascript) (msgpack.codec)

### Benchmark

A benchmark tool `lib/benchmark.js` is available to compare encoding/decoding speed
(operation per second) with other MessagePack modules.
It counts operations of [1KB JSON document](https://github.com/kawanet/msgpack-lite/blob/master/test/example.json) in 10 seconds.

operation                                                 |   op   |   ms  |  op/s 
--------------------------------------------------------- | -----: | ----: | -----:
buf = Buffer(JSON.stringify(obj));                        | 261300 | 10002 |  26124
obj = JSON.parse(buf);                                    | 259200 | 10013 |  25886
buf = require("msgpack-lite").encode(obj);                | 242800 | 10001 |  24277
obj = require("msgpack-lite").decode(buf);                | 212000 | 10002 |  21195
buf = require("msgpack").pack(obj);                       | 162800 | 10009 |  16265
obj = require("msgpack").unpack(buf);                     | 189800 | 10012 |  18957
buf = Buffer(require("msgpack.codec").msgpack.pack(obj)); |  46900 | 10006 |   4687
obj = require("msgpack.codec").msgpack.unpack(buf);       | 155900 | 10000 |  15590
buf = require("msgpack-js-v5").encode(obj);               |  45200 | 10017 |   4512
obj = require("msgpack-js-v5").decode(buf);               | 146700 | 10015 |  14648
buf = require("msgpack-js").encode(obj);                  |  43000 | 10009 |   4296
obj = require("msgpack-js").decode(buf);                  | 146400 | 10011 |  14623
buf = require("msgpack5")().encode(obj);                  |   4500 | 10040 |    448
obj = require("msgpack5")().decode(buf);                  |  18900 | 10025 |   1885
obj = require("msgpack-unpack").decode(buf);              |   1000 | 10343 |     96

Streaming benchmark tool `lib/benchmark-stream.js` is also available.
It counts milliseconds for 1,000,000 operations of 30 bytes fluentd msgpack fragment.
This shows streaming encoding and decoding are super faster.

operation (1000000 x 3)                          |   op    |  ms   |  op/s 
------------------------------------------------ | ------: | ----: | -----:
stream.write(msgpack.encode(obj));               | 1000000 | 36072 |  27722
msgpack.createEncodeStream().write(obj);         | 1000000 |  6080 | 164473
stream.write(msgpack.decode(buf));               | 1000000 |  9568 | 104515
msgpack.createDecodeStream().write(buf);         | 1000000 |  5681 | 176025

Test environment: msgpack-lite 0.1.13 on Node v0.12.7

### MessagePack Mapping Table

The following table shows how JavaScript objects (value) will be mapped to 
[MessagePack formats](https://github.com/msgpack/msgpack/blob/master/spec.md)
and vice versa.

Source Value|MessagePack Format|Value Decoded
----|----|----
null, undefined|nil format family|null
Boolean (true, false)|bool format family|Boolean (true, false)
Number (32bit int)|int format family|Number (int or double)
Number (64bit double)|float format family|Number (double)
String|str format family|String
Buffer|bin format family|Buffer
Array|array format family|Array
Object (plain object)|map format family|Object
Object (see below)|ext format family|Object (see below)

Note that both `null` and `undefined` are mapped to nil `0xC1` type.
This means `undefined` value will be *upgraded* to `null` in other words.

### Extension Types

The MessagePack specification allows 128 application-specific extension types. 
The library uses the following types to make round-trip conversion possible
for JavaScript native objects.

Type|Object|Type|Object
----|----|----|----
0x00||0x10|
0x01|EvalError|0x11|Int8Array
0x02|RangeError|0x12|Uint8Array
0x03|ReferenceError|0x13|Int16Array
0x04|SyntaxError|0x14|Uint16Array
0x05|TypeError|0x15|Int32Array
0x06|URIError|0x16|Uint32Array
0x07||0x17|Float32Array
0x08||0x18|Float64Array
0x09||0x19|Uint8ClampedArray
0x0A|RegExp|0x1A|ArrayBuffer
0x0B|Boolean|0x1B|
0x0C|String|0x1C|
0x0D|Date|0x1D|DataView
0x0E|Error|0x1E|
0x0F|Number|0x1F|

Other extension types are mapped to internal ExtBuffer object.

### Repository

- [https://github.com/kawanet/msgpack-lite](https://github.com/kawanet/msgpack-lite)

### See Also

- [http://msgpack.org/](http://msgpack.org/)

### License

The MIT License (MIT)

Copyright (c) 2015 Yusuke Kawasaki

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
