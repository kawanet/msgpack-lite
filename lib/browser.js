// browser.js

exports.encode = require("./encode").encode;
exports.decode = require("./decode").decode;

exports.Encoder = require("./encoder").Encoder;
exports.Decoder = require("./decoder").Decoder;

exports.createEncodeStream = require("./encode-stream").createEncodeStream;
exports.createDecodeStream = require("./decode-stream").createDecodeStream;

exports.createCodec = require("./ext").createCodec;
exports.codec = require("./codec").codec;
