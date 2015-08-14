# msgpack-lite [![npm version](https://badge.fury.io/js/msgpack-lite.svg)](http://badge.fury.io/js/msgpack-lite) [![Build Status](https://travis-ci.org/kawanet/msgpack-lite.svg?branch=master)](https://travis-ci.org/kawanet/msgpack-lite)

Fast Pure JavaScript MessagePack Encoder and Decoder

Online Demo: http://kawanet.github.io/msgpack-lite/

### Encoding and Decoding

```js
var msgpack = require("msgpack-lite");

// encode from Object to MessagePack (Buffer)
var buffer = msgpack.encode({foo: "bar"});

// decode from MessagePack (Buffer) to Object 
var data = msgpack.decode(buffer); // => {foo: "bar"}
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

// show objects decoded
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

Browser version is also available. 28KB minified, 9KB gziped.

```html
<script src="https://rawgithub.com/kawanet/msgpack-lite/master/dist/msgpack.min.js"></script>
<script>
// encode from Object to MessagePack (Uint8Array)
var buffer = msgpack.encode({foo: "bar"});

// decode from MessagePack (Uint8Array) to Object 
var array = new Uint8Array([0x81, 0xA3, 0x66, 0x6F, 0x6F, 0xA3, 0x62, 0x61, 0x72]);
var data = msgpack.decode(array);
</script>
```

### Compatibility

It is tested to have basic compatibility with other MessagePack modules below:

- https://www.npmjs.com/package/msgpack
- https://www.npmjs.com/package/msgpack-js
- https://www.npmjs.com/package/msgpack-js-v5
- https://www.npmjs.com/package/msgpack5
- https://www.npmjs.com/package/msgpack-unpack
- https://github.com/msgpack/msgpack-javascript (msgpack.codec)

### Speed Comparison

A benchmark tool lib/benchmark.js is available to compare encoding/decoding speed.

```txt
$ node -v
v0.10.40
$ node lib/benchmark.js 10
operation                                                      | result             | op/ms
-------------------------------------------------------------- | ------------------ | -----
buf = Buffer(JSON.stringify(obj));                             | 227000op / 10001ms | 2269
obj = JSON.parse(buf);                                         | 243900op / 10004ms | 2438
buf = require("msgpack").pack(obj);                            | 179500op / 10005ms | 1794
obj = require("msgpack").unpack(buf);                          | 233400op / 10011ms | 2331
buf = require("msgpack-lite").encode(obj);                     | 201100op / 10007ms | 2009
obj = require("msgpack-lite").decode(buf);                     | 148800op / 10000ms | 1488
buf = Buffer(require("msgpack-javascript").msgpack.pack(obj)); | 138400op / 10004ms | 1383
obj = require("msgpack-javascript").msgpack.unpack(buf);       | 103100op / 10000ms | 1031
buf = require("msgpack-js-v5").encode(obj);                    | 29400op / 10030ms  | 293
obj = require("msgpack-js-v5").decode(buf);                    | 104400op / 10012ms | 1042
buf = require("msgpack-js").encode(obj);                       | 29800op / 10028ms  | 297
obj = require("msgpack-js").decode(buf);                       | 105100op / 10003ms | 1050
buf = require("msgpack5")().encode(obj);                       | 4500op / 10106ms   | 44
obj = require("msgpack5")().decode(buf);                       | 19000op / 10018ms  | 189
obj = require("msgpack-unpack").decode(buf);                   | 1600op / 10211ms   | 15
```

The msgpack-lite is the fastest module on both encoding and decoding
operations compared to the other pure JavaScript msgpack-* modules.
It's even 12% faster than node-gyp backed msgpack module on encoding!

### Repository

- https://github.com/kawanet/msgpack-lite

### See Also

- http://msgpack.org/

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
