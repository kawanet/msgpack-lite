# msgpack-lite [![npm version](https://badge.fury.io/js/msgpack-lite.svg)](http://badge.fury.io/js/msgpack-lite) [![Build Status](https://travis-ci.org/kawanet/msgpack-lite.svg?branch=master)](https://travis-ci.org/kawanet/msgpack-lite)

Fast Pure JavaScript MessagePack Encoder and Decoder

[![Sauce Test Status](https://saucelabs.com/browser-matrix/msgpack-lite.svg)](https://saucelabs.com/u/msgpack-lite)

Online demo: [http://kawanet.github.io/msgpack-lite/](http://kawanet.github.io/msgpack-lite/)

### Significantly Fast Encoding

- **5x faster** than other pure JavaScript libraries! (Node.js v0.12.7)
- **50% faster** than C++ node-gyp based [msgpack](https://www.npmjs.com/package/msgpack) library!

### Fast Decoding

- **20% faster** than other pure JavaScript libraries!
- **5% faster** than C++ node-gyp based msgpack library!

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

Browser version [msgpack.min.js](https://rawgithub.com/kawanet/msgpack-lite/master/dist/msgpack.min.js) is also available. 33KB minified, 10KB gziped.

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

A benchmark tool lib/benchmark.js is available to compare encoding/decoding speed
(operation per second) with other MessagePack modules.

```txt
$ cat /etc/system-release
Amazon Linux AMI release 2015.03

$ node lib/benchmark.js -v
msgpack-lite 0.1.10

$ nvm use v0.10
Now using node v0.10.40

$ node lib/benchmark.js 10
operation                                                 | op / ms            | op/s
--------------------------------------------------------- | ------------------ | -----
buf = Buffer(JSON.stringify(obj));                        | 223400op / 10001ms | 2233
obj = JSON.parse(buf);                                    | 240800op / 10002ms | 2407
buf = require("msgpack").pack(obj);                       | 187000op / 10000ms | 1870
obj = require("msgpack").unpack(buf);                     | 231800op / 10001ms | 2317
buf = require("msgpack-lite").encode(obj);                | 228700op / 10004ms | 2286
obj = require("msgpack-lite").decode(buf);                | 193900op / 10001ms | 1938
buf = Buffer(require("msgpack.codec").msgpack.pack(obj)); | 138100op / 10006ms | 1380
obj = require("msgpack.codec").msgpack.unpack(buf);       | 101400op / 10011ms | 1012
buf = require("msgpack-js-v5").encode(obj);               | 29800op / 10015ms  | 297
obj = require("msgpack-js-v5").decode(buf);               | 108200op / 10002ms | 1081
buf = require("msgpack-js").encode(obj);                  | 30100op / 10008ms  | 300
obj = require("msgpack-js").decode(buf);                  | 105800op / 10018ms | 1056
buf = require("msgpack5")().encode(obj);                  | 4400op / 10152ms   | 43
obj = require("msgpack5")().decode(buf);                  | 18600op / 10024ms  | 185
obj = require("msgpack-unpack").decode(buf);              | 1600op / 10208ms   | 15
```

This runs more faster on Node.js 0.12.

```txt
$ nvm use v0.12
Now using node v0.12.7

$ node lib/benchmark.js 10
operation                                                 | op / ms            | op/s
--------------------------------------------------------- | ------------------ | -----
buf = Buffer(JSON.stringify(obj));                        | 258000op / 10012ms | 2576
obj = JSON.parse(buf);                                    | 260300op / 10002ms | 2602
buf = require("msgpack").pack(obj);                       | 163600op / 10002ms | 1635
obj = require("msgpack").unpack(buf);                     | 196400op / 10012ms | 1961
buf = require("msgpack-lite").encode(obj);                | 248900op / 10008ms | 2487
obj = require("msgpack-lite").decode(buf);                | 199600op / 10002ms | 1995
buf = Buffer(require("msgpack.codec").msgpack.pack(obj)); | 47600op / 10001ms  | 475
obj = require("msgpack.codec").msgpack.unpack(buf);       | 165500op / 10001ms | 1654
buf = require("msgpack-js-v5").encode(obj);               | 43500op / 10007ms  | 434
obj = require("msgpack-js-v5").decode(buf);               | 152700op / 10005ms | 1526
buf = require("msgpack-js").encode(obj);                  | 44200op / 10014ms  | 441
obj = require("msgpack-js").decode(buf);                  | 145300op / 10000ms | 1453
buf = require("msgpack5")().encode(obj);                  | 4500op / 10185ms   | 44
obj = require("msgpack5")().decode(buf);                  | 18700op / 10004ms  | 186
obj = require("msgpack-unpack").decode(buf);              | 1000op / 10377ms   | 9
```

This is also compatible with [io.js](https://iojs.org/).

```txt
$ nvm use iojs
Now using io.js v3.1.0

$ node lib/benchmark.js 10
operation                                                 | op / ms            | op/s
--------------------------------------------------------- | ------------------ | -----
buf = Buffer(JSON.stringify(obj));                        | 338100op / 10001ms | 3380
obj = JSON.parse(buf);                                    | 314900op / 10001ms | 3148
buf = require("msgpack-lite").encode(obj);                | 240300op / 10006ms | 2401
obj = require("msgpack-lite").decode(buf);                | 215600op / 10001ms | 2155
buf = Buffer(require("msgpack.codec").msgpack.pack(obj)); | 242700op / 10002ms | 2426
obj = require("msgpack.codec").msgpack.unpack(buf);       | 153000op / 10011ms | 1528
buf = require("msgpack-js-v5").encode(obj);               | 45000op / 10015ms  | 449
obj = require("msgpack-js-v5").decode(buf);               | 96900op / 10009ms  | 968
buf = require("msgpack-js").encode(obj);                  | 44600op / 10021ms  | 445
obj = require("msgpack-js").decode(buf);                  | 94000op / 10002ms  | 939
buf = require("msgpack5")().encode(obj);                  | 4300op / 10231ms   | 42
obj = require("msgpack5")().decode(buf);                  | 15800op / 10008ms  | 157
obj = require("msgpack-unpack").decode(buf);              | 13000op / 10068ms  | 129
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
