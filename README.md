# msgpack-lite [![npm version](https://badge.fury.io/js/msgpack-lite.svg)](http://badge.fury.io/js/msgpack-lite) [![Build Status](https://travis-ci.org/kawanet/msgpack-lite.svg?branch=master)](https://travis-ci.org/kawanet/msgpack-lite)

Fast Pure JavaScript MessagePack Encoder and Decoder

Try online demo: [http://kawanet.github.io/msgpack-lite/](http://kawanet.github.io/msgpack-lite/)

### Fastest Encoding

- 69% faster than the official pure JavaScript [msgpack-javascript](https://github.com/msgpack/msgpack-javascript) library!
- 29% faster than C++ node-gyp based [msgpack](https://www.npmjs.com/package/msgpack) library!
- 6% faster than `Buffer(JSON.stringify(object))`, surprisingly!

### Fast Decoding

- 64% faster than the pure JavaScript [msgpack-js-v5](https://www.npmjs.com/package/msgpack-js-v5) library!
- 22% slower than C++ node-gyp based [msgpack](https://www.npmjs.com/package/msgpack) library.
- 26% slower than `JSON.parse(buffer)`, as expected.

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
msgpack-lite 0.1.5
$ nvm use v0.10.40
Now using node v0.10.40
$ node lib/benchmark.js 10
operation                                                      | result             | op/s
-------------------------------------------------------------- | ------------------ | -----
buf = Buffer(JSON.stringify(obj));                             | 222600op / 10000ms | 2226
obj = JSON.parse(buf);                                         | 245900op / 10008ms | 2457
buf = require("msgpack").pack(obj);                            | 184700op / 10002ms | 1846
obj = require("msgpack").unpack(buf);                          | 233300op / 10000ms | 2333
buf = require("msgpack-lite").encode(obj);                     | 236800op / 10006ms | 2366
obj = require("msgpack-lite").decode(buf);                     | 182900op / 10007ms | 1827
buf = Buffer(require("msgpack-javascript").msgpack.pack(obj)); | 140700op / 10010ms | 1405
obj = require("msgpack-javascript").msgpack.unpack(buf);       | 99500op / 10008ms  | 994
buf = require("msgpack-js-v5").encode(obj);                    | 29200op / 10008ms  | 291
obj = require("msgpack-js-v5").decode(buf);                    | 111500op / 10003ms | 1114
buf = require("msgpack-js").encode(obj);                       | 29100op / 10005ms  | 290
obj = require("msgpack-js").decode(buf);                       | 106300op / 10011ms | 1061
buf = require("msgpack5")().encode(obj);                       | 4400op / 10148ms   | 43
obj = require("msgpack5")().decode(buf);                       | 18300op / 10051ms  | 182
obj = require("msgpack-unpack").decode(buf);                   | 1600op / 10200ms   | 15
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
buf = Buffer(JSON.stringify(obj));                             | 265000op / 10000ms | 2650
obj = JSON.parse(buf);                                         | 259600op / 10002ms | 2595
buf = require("msgpack").pack(obj);                            | 159200op / 10001ms | 1591
obj = require("msgpack").unpack(buf);                          | 191800op / 10001ms | 1917
buf = require("msgpack-lite").encode(obj);                     | 244500op / 10001ms | 2444
obj = require("msgpack-lite").decode(buf);                     | 173700op / 10001ms | 1736
buf = Buffer(require("msgpack-javascript").msgpack.pack(obj)); | 46600op / 10016ms  | 465
obj = require("msgpack-javascript").msgpack.unpack(buf);       | 166100op / 10008ms | 1659
buf = require("msgpack-js-v5").encode(obj);                    | 41800op / 10021ms  | 417
obj = require("msgpack-js-v5").decode(buf);                    | 146000op / 10008ms | 1458
buf = require("msgpack-js").encode(obj);                       | 41000op / 10029ms  | 408
obj = require("msgpack-js").decode(buf);                       | 140500op / 10007ms | 1404
buf = require("msgpack5")().encode(obj);                       | 4600op / 10194ms   | 45
obj = require("msgpack5")().decode(buf);                       | 19300op / 10011ms  | 192
obj = require("msgpack-unpack").decode(buf);                   | 1100op / 10873ms   | 10
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
