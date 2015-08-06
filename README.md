# msgpack-lite [![npm version](https://badge.fury.io/js/msgpack-lite.svg)](http://badge.fury.io/js/msgpack-lite) [![Build Status](https://travis-ci.org/kawanet/msgpack-lite.svg?branch=master)](https://travis-ci.org/kawanet/msgpack-lite)

Fast Pure JavaScript MessagePack Encoder and Decoder

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
$ node lib/benchmark.js 10
operation                                                   | result             | op/ms
----------------------------------------------------------- | ------------------ | -----
buf = Buffer(JSON.stringify(obj));                          | 426100op / 10000ms | 4261
obj = JSON.parse(buf);                                      | 473100op / 10001ms | 4730
buf = require("msgpack").pack(obj);                         | 331600op / 10002ms | 3315
obj = require("msgpack").unpack(buf);                       | 316800op / 10003ms | 3167
buf = require("msgpack-lite").encode(obj);                  | 326100op / 10001ms | 3260
obj = require("msgpack-lite").decode(buf);                  | 209300op / 10000ms | 2093
buf = Buffer(require("./msgpack.codec").msgpack.pack(obj)); | 256800op / 10003ms | 2567
obj = require("./msgpack.codec").msgpack.unpack(buf);       | 170400op / 10002ms | 1703
buf = require("msgpack-js-v5").encode(obj);                 | 66300op / 10003ms  | 662
obj = require("msgpack-js-v5").decode(buf);                 | 188000op / 10003ms | 1879
buf = require("msgpack-js").encode(obj);                    | 63100op / 10004ms  | 630
obj = require("msgpack-js").decode(buf);                    | 189200op / 10003ms | 1891
buf = require("msgpack5")().encode(obj);                    | 8000op / 10008ms   | 79
obj = require("msgpack5")().decode(buf);                    | 32700op / 10020ms  | 326
```

The msgpack-lite is the fastest module on both encoding and decoding
operations compared to the other pure JavaScript msgpack-* modules.
Please note that node-gyp backed msgpack module is more fast still, however.

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
