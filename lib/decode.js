// decode.js

var Decoder = require("./decoder").Decoder;

exports.decode = function(input) {
  var output = [];
  var decoder = new Decoder(output);
  decoder.decode(input);
  return output.shift();
};
