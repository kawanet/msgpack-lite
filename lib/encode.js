// encode.js

var Stream = require("stream");
var Encoder = require("./encoder").Encoder;

exports.encode = function(input, output) {
  var result = [];
  var inputIsStream = (input instanceof Stream);
  var outputIsStream = (output && output.write instanceof Function);

  var encoder = new Encoder();

  if (outputIsStream) {
    encoder.push = output.write.bind(output);
  } else {
    encoder.push = result.push.bind(result);
  }

  // input Stream
  if (inputIsStream) {
    input.on("end", function() {
      encoder.flush();
      output.end();
    });

    input.on("data", encoder._transform.bind(encoder));
  } else {
    encoder._transform(input);
  }

  return !outputIsStream && Buffer.concat(result);
};
