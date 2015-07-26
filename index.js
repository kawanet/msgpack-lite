// msgpack.js

exports.encode = require("./lib/encode").encode;
exports.decode = require("./lib/decode").decode;

exports.createEncodeStream = require("./lib/encode-stream").createEncodeStream;
exports.createDecodeStream = require("./lib/decode-stream").createDecodeStream;
