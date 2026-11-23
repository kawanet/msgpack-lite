// decode.js

exports.decode = decode;
exports.decodeWithOffset = decodeWithOffset;

var DecodeBuffer = require("./decode-buffer").DecodeBuffer;

function decode(input, options) {
  var decoder = new DecodeBuffer(options);
  decoder.write(input);
  return decoder.read();
}

function decodeWithOffset(input, options) {
  var decoder = new DecodeBuffer(options);
  decoder.write(input);
  var value = decoder.read();
  return {value: value, bytesRead: decoder.offset};
}
