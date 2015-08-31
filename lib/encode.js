// encode.js

exports.encode = encode;

var Encoder = require("./encoder").Encoder;

function encode(input) {
  var output = [];
  var encoder = new Encoder(output);
  encoder.encode(input);
  encoder.flush();
  return (output.length === 1) ? output[0] : Buffer.concat(output);
}
