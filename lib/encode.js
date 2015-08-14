// encode.js

var Encoder = require("./encoder").Encoder;

exports.encode = function(input) {
  var output = [];
  var encoder = new Encoder(output);
  encoder.encode(input);
  return (output.length === 1) ? output[0] : Buffer.concat(output);
};
