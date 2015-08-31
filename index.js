// msgpack.js

exports.encode = require("./lib/encode").encode;
exports.decode = require("./lib/decode").decode;

exports.Encoder = require("./lib/encode").Encoder;
exports.Decoder = require("./lib/decode").Decoder;

exports.createEncodeStream = require("./lib/encode-stream").createEncodeStream;
exports.createDecodeStream = require("./lib/decode-stream").createDecodeStream;
