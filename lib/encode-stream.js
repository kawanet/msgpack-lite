// encode-stream.js

exports.createEncodeStream = EncodeStream;

var util = require("util");
var Transform = require("stream").Transform;
var Encoder = require("./encoder").Encoder;

util.inherits(EncodeStream, Transform);

function EncodeStream() {
  if (!(this instanceof EncodeStream)) return new EncodeStream();
  Transform.call(this, {objectMode: true});
  this.encoder = new Encoder(this);
}

EncodeStream.prototype._transform = function(chunk, encoding, callback) {
  this.encoder.encode(chunk);
  if (callback) callback();
};

EncodeStream.prototype._flush = function(callback) {
  this.encoder.flush();
  if (callback) callback();
};
