// decode.js

var Stream = require("stream");
var Decoder = require("./decoder").Decoder;

exports.decode = function(input, output) {
  var inputIsStream = (input instanceof Stream);
  var outputIsStream = (output && output.write instanceof Function);
  if (!outputIsStream) output = [];

  var opts = outputIsStream ? {push: output.write.bind(output)} : output;
  var decoder = new Decoder(opts);

  if (inputIsStream) {
    input.on("end", function() {
      decoder.decode();
      output.end();
    });

    input.on("data", decoder._transform.bind(decoder));
  } else {
    decoder._transform(input);
  }

  return !outputIsStream && output.shift();
};
