// decode-stream.js

exports.createDecodeStream = DecodeStream;

var util = require("util");
var Transform = require("stream").Transform;
var DecodeBuffer = require("./decode-buffer").DecodeBuffer;
var decodeAsync = require("./read-core").decodeAsync;

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
  var decoder = this.decoder = new DecodeBuffer(options);
  decoder.push = function(chunk) {
    stream.push(chunk);
  };
}

DecodeStream.prototype._transform = function(chunk, encoding, callback) {
  this.decoder.append(chunk);
  decodeAsync(this.decoder);
  if (callback) callback();
};
