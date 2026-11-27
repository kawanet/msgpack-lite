// encode-stream.js

exports.createEncodeStream = EncodeStream;

var util = require("util");
var Transform = require("stream").Transform;
var EncodeBuffer = require("./encode-buffer").EncodeBuffer;

util.inherits(EncodeStream, Transform);

function EncodeStream(options) {
  if (!(this instanceof EncodeStream)) return new EncodeStream(options);
  options = Object.assign({}, options, {objectMode: true});
  Transform.call(this, options);

  var stream = this;
  var encoder = this.encoder = new EncodeBuffer(options);
  encoder.push = function(chunk) {
    stream.push(chunk);
  };
}

EncodeStream.prototype._transform = function(chunk, encoding, callback) {
  try {
    this.encoder.write(chunk);
  } catch(e) {
    return callback(e);
  }
  callback();
};

EncodeStream.prototype._flush = function(callback) {
  try {
    this.encoder.flush();
  } catch(e) {
    return callback(e);
  }
  callback();
};
