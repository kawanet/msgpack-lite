// encode-stream.js

exports.createEncodeStream = EncodeStream;

var util = require("util");
var Transform = require("stream").Transform;
var Encoder = require("./encoder").Encoder;

util.inherits(EncodeStream, Transform);

var DEFAULT_OPTIONS = {objectMode: true};

function EncodeStream(options) {
  if (!(this instanceof EncodeStream)) return new EncodeStream(options);
  if (options) {
    options.objectMode = true;
  } else {
    options = DEFAULT_OPTIONS;
  }
  Transform.call(this, options);
  var stream = this;
  var encoder = this.encoder = new Encoder(options);
  encoder.ondata = ondata;

  function ondata(chunk) {
    stream.push(chunk);
  }
}

EncodeStream.prototype._transform = function(chunk, encoding, callback) {
  this.encoder.encode(chunk);
  if (callback) callback();
};

EncodeStream.prototype._flush = function(callback) {
  this.encoder.flush();
  if (callback) callback();
};
