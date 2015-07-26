// encode.js

var Stream = require("stream");
var Encoder = require("./encoder").Encoder;

exports.encode = function(input, output) {
  var inputIsStream = (input instanceof Stream);
  var outputIsStream = (output && output.write instanceof Function);
  if (!outputIsStream) output = [];

  var opts = outputIsStream ? {push: output.write.bind(output)} : output;
  var encoder = new Encoder(opts);

  if (inputIsStream) {
    input.on("end", function() {
      encoder.flush();
      output.end();
    });

    input.on("data", encoder.encode.bind(encoder));
  } else {
    encoder.encode(input);
  }

  return !outputIsStream && Buffer.concat(output);
};
