# msgpack-lite [![npm version](https://badge.fury.io/js/msgpack-lite.svg)](http://badge.fury.io/js/msgpack-lite) [![Build Status](https://travis-ci.org/kawanet/msgpack-lite.svg?branch=master)](https://travis-ci.org/kawanet/msgpack-lite)

Fast Pure JavaScript MessagePack Encoder and Decoder

Try online demo: [http://kawanet.github.io/msgpack-lite/](http://kawanet.github.io/msgpack-lite/)

### Significantly Fast Encoding

- 63% faster than the official pure JavaScript [msgpack-javascript](https://github.com/msgpack/msgpack-javascript) library!
- 27% faster than C++ node-gyp based [msgpack](https://www.npmjs.com/package/msgpack) library!
- 5% faster than `Buffer(JSON.stringify(object))`, surprisingly!

### Fast Decoding

- 68% faster than the pure JavaScript [msgpack-js](https://www.npmjs.com/package/msgpack-js) library!
- 19% slower than C++ node-gyp based msgpack library.
- 22% slower than `JSON.parse(buffer)`, as expected.

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

### Browser Build

Browser version is also available. 33KB minified, 10KB gziped.

```html
<script src="https://rawgithub.com/kawanet/msgpack-lite/master/dist/msgpack.min.js"></script>
<script>
// encode from JS Object to MessagePack (Uint8Array)
var buffer = msgpack.encode({foo: "bar"});

// decode from MessagePack (Uint8Array) to JS Object
var array = new Uint8Array([0x81, 0xA3, 0x66, 0x6F, 0x6F, 0xA3, 0x62, 0x61, 0x72]);
var data = msgpack.decode(array);
</script>
```

It works even on IE9 with [es5-shim ](https://github.com/es-shims/es5-shim).

### Interoperability

It is tested to have basic compatibility with other Node.js MessagePack modules below:

- [https://www.npmjs.com/package/msgpack](https://www.npmjs.com/package/msgpack) (0.2.6)
- [https://www.npmjs.com/package/msgpack-js](https://www.npmjs.com/package/msgpack-js) (0.3.0)
- [https://www.npmjs.com/package/msgpack-js-v5](https://www.npmjs.com/package/msgpack-js-v5) (0.3.0-v5)
- [https://www.npmjs.com/package/msgpack5](https://www.npmjs.com/package/msgpack5) (3.1.0)
- [https://www.npmjs.com/package/msgpack-unpack](https://www.npmjs.com/package/msgpack-unpack) (2.1.1)
- [https://github.com/msgpack/msgpack-javascript](https://github.com/msgpack/msgpack-javascript) (msgpack.codec)

### Speed Comparison

A benchmark tool lib/benchmark.js is available to compare encoding/decoding speed.

```txt
$ cat /etc/system-release
Amazon Linux AMI release 2015.03
$ node lib/benchmark.js -v
msgpack-lite 0.1.7
$ nvm use v0.10.40
Now using node v0.10.40
$ node lib/benchmark.js 10
operation                                                      | result             | op/s
-------------------------------------------------------------- | ------------------ | -----
buf = Buffer(JSON.stringify(obj));                             | 219300op / 10001ms | 2192
obj = JSON.parse(buf);                                         | 244000op / 10002ms | 2439
buf = require("msgpack").pack(obj);                            | 180100op / 10005ms | 1800
obj = require("msgpack").unpack(buf);                          | 232000op / 10013ms | 2316
buf = require("msgpack-lite").encode(obj);                     | 229300op / 10001ms | 2292
obj = require("msgpack-lite").decode(buf);                     | 188400op / 10002ms | 1883
buf = Buffer(require("msgpack-javascript").msgpack.pack(obj)); | 140800op / 10009ms | 1406
obj = require("msgpack-javascript").msgpack.unpack(buf);       | 100000op / 10004ms | 999
buf = require("msgpack-js-v5").encode(obj);                    | 29700op / 10017ms  | 296
obj = require("msgpack-js-v5").decode(buf);                    | 106700op / 10006ms | 1066
buf = require("msgpack-js").encode(obj);                       | 29000op / 10032ms  | 289
obj = require("msgpack-js").decode(buf);                       | 112400op / 10010ms | 1122
buf = require("msgpack5")().encode(obj);                       | 4400op / 10238ms   | 42
obj = require("msgpack5")().decode(buf);                       | 19100op / 10007ms  | 190
obj = require("msgpack-unpack").decode(buf);                   | 1600op / 10219ms   | 15
```

The msgpack-lite is the fastest module on both encoding and decoding
operations compared to the other pure JavaScript msgpack-* modules.
It's even faster than C++ node-gyp backed msgpack module on encoding!

```txt
$ nvm use v0.12.7
Now using node v0.12.7
$ node lib/benchmark.js 10
operation                                                      | result             | op/s
-------------------------------------------------------------- | ------------------ | -----
buf = Buffer(JSON.stringify(obj));                             | 263200op / 10000ms | 2632
obj = JSON.parse(buf);                                         | 262000op / 10000ms | 2620
buf = require("msgpack").pack(obj);                            | 160400op / 10006ms | 1603
obj = require("msgpack").unpack(buf);                          | 197800op / 10003ms | 1977
buf = require("msgpack-lite").encode(obj);                     | 244800op / 10000ms | 2448
obj = require("msgpack-lite").decode(buf);                     | 180000op / 10003ms | 1799
buf = Buffer(require("msgpack-javascript").msgpack.pack(obj)); | 44400op / 10009ms  | 443
obj = require("msgpack-javascript").msgpack.unpack(buf);       | 166200op / 10002ms | 1661
buf = require("msgpack-js-v5").encode(obj);                    | 42200op / 10014ms  | 421
obj = require("msgpack-js-v5").decode(buf);                    | 150100op / 10006ms | 1500
buf = require("msgpack-js").encode(obj);                       | 42500op / 10002ms  | 424
obj = require("msgpack-js").decode(buf);                       | 135900op / 10001ms | 1358
buf = require("msgpack5")().encode(obj);                       | 4500op / 10099ms   | 44
obj = require("msgpack5")().decode(buf);                       | 18900op / 10025ms  | 188
obj = require("msgpack-unpack").decode(buf);                   | 1000op / 10280ms   | 9
```

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
