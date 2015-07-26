// decode.js

var Stream = require("stream");
var Decoder = require("./decoder").Decoder;

exports.decode = function(input, output) {
  var result = [];
  var inputIsStream = (input instanceof Stream);
  var outputIsStream = (output && output.write instanceof Function);

  var decoder = new Decoder();

  if (outputIsStream) {
    decoder.push = output.write.bind(output);
  } else {
    decoder.push = result.push.bind(result);
  }

  if (inputIsStream) {
    input.on("end", function() {
      decoder.decode();
      output.end();
    });

    input.on("data", decoder._transform.bind(decoder));
  } else {
    decoder._transform(input);
  }

  return !outputIsStream && result.shift();
};
