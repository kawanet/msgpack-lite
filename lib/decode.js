// decode.js

exports.decode = decode;

var Decoder = require("./decoder").Decoder;

function decode(input, options) {
  var output = [];
  var decoder = new Decoder(options, output);
  decoder.decode(input);
  return output[0];
}