// decode.js

exports.decode = decode;

var DecodeBuffer = require("./decode-buffer").DecodeBuffer;
var decode = require("./read-core").decode;

function decode(input, options) {
  var decoder = new DecodeBuffer(options);
  decoder.append(input);
  return decode(decoder);
}