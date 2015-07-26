// encode.js

var Encoder = require("./encoder").Encoder;

exports.encode = function(input) {
  var output = [];
  var encoder = new Encoder(output);
  encoder.encode(input);
  return Buffer.concat(output);
};
