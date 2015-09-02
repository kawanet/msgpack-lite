// decode.js

exports.decode = decode;

var Decoder = require("./decoder").Decoder;

function decode(input, options) {
  var output = [];
  var decoder = new Decoder(options);
  decoder.ondata = ondata;
  decoder.onend = null;
  decoder.end(input);
  return output[0];

  function ondata(chunk) {
    output.push(chunk);
  }
}