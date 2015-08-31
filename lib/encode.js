// encode.js
exports.encode = encode;

var Encoder = require("./encoder").Encoder;

exports.Encoder = Encoder;

function encode(input) {
  var encoder = new Encoder();
  return encoder.encode(input);
}