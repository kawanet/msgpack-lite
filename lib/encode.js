// encode.js

exports.encode = encode;

var encode = require("./write-core").encode;
var EncodeBuffer = require("./encode-buffer").EncodeBuffer;

function encode(input, options) {
  var encoder = new EncodeBuffer(options);
  encode(encoder, input);
  return encoder.read();
}
