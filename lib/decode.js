// decode.js
exports.decode = decode;

var Decoder = require("./decoder").Decoder;

exports.Decoder = Decoder;

function decode(input) {
  var output = [];
  var decoder = new Decoder(output);
  decoder.decode(input);
  return output[0];
}