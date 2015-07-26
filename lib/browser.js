// browser.js

var Decoder = require("./decoder").Decoder;
var Encoder = require("./encoder").Encoder;

exports.decode = function(input, output) {
  var outputIsStream = (output && output.write instanceof Function);
  if (!outputIsStream) output = [];

  var opts = outputIsStream ? {push: output.write.bind(output)} : output;
  var decoder = new Decoder(opts);
  decoder.decode(input);

  return !outputIsStream && output.shift();
};

exports.encode = function(input, output) {
  var outputIsStream = (output && output.write instanceof Function);
  if (!outputIsStream) output = [];

  var opts = outputIsStream ? {push: output.write.bind(output)} : output;
  var encoder = new Encoder(opts);
  encoder.encode(input);

  return !outputIsStream && Buffer.concat(output);
};
