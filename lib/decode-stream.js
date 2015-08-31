// decode-stream.js

exports.createDecodeStream = DecodeStream;

var util = require("util");
var Transform = require("stream").Transform;
var Decoder = require("./decoder").Decoder;

util.inherits(DecodeStream, Transform);

function DecodeStream() {
  if (!(this instanceof DecodeStream)) return new DecodeStream();
  Transform.call(this, {objectMode: true});
  this.decoder = new Decoder(this);
}

DecodeStream.prototype._transform = function(chunk, encoding, callback) {
  this.decoder.decode(chunk);
  if (callback) callback();
};
