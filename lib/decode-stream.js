// decode-stream.js

exports.createDecodeStream = DecodeStream;

var util = require("util");
var Transform = require("stream").Transform;
var DecodeBuffer = require("./decode-buffer").DecodeBuffer;

util.inherits(DecodeStream, Transform);

function DecodeStream(options) {
  if (!(this instanceof DecodeStream)) return new DecodeStream(options);
  options = Object.assign({}, options, {objectMode: true});
  Transform.call(this, options);
  var stream = this;
  var decoder = this.decoder = new DecodeBuffer(options);
  decoder.push = function(chunk) {
    stream.push(chunk);
  };
}

DecodeStream.prototype._transform = function(chunk, encoding, callback) {
  try {
    this.decoder.write(chunk);
    this.decoder.flush();
  } catch(e) {
    return callback(e);
  }
  callback();
};
