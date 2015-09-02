// encode.js

exports.encode = encode;

var Encoder = require("./encoder").Encoder;

function encode(input, options) {
  var output = [];
  var encoder = new Encoder(options);
  encoder.ondata = ondata;
  encoder.encode(input);
  encoder.flush();
  return (output.length === 1) ? output[0] : Buffer.concat(output);

  function ondata(chunk) {
    output.push(chunk);
  }
}
