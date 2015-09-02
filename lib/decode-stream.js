// decode-stream.js

exports.createDecodeStream = DecodeStream;

var util = require("util");
var Transform = require("stream").Transform;
var Decoder = require("./decoder").Decoder;

util.inherits(DecodeStream, Transform);

var DEFAULT_OPTIONS = {objectMode: true};

function DecodeStream(options) {
  if (!(this instanceof DecodeStream)) return new DecodeStream(options);
  if (options) {
    options.objectMode = true;
  } else {
    options = DEFAULT_OPTIONS;
  }
  Transform.call(this, options);
  var stream = this;
  var decoder = this.decoder = new Decoder(options);
  decoder.ondata = ondata;

  function ondata(chunk) {
    stream.push(chunk);
  }
}

DecodeStream.prototype._transform = function(chunk, encoding, callback) {
  this.decoder.decode(chunk);
  if (callback) callback();
};
