// encode-stream.js

exports.createEncodeStream = EncodeStream;

var util = require("util");
var Transform = require("stream").Transform;
var EncodeBuffer = require("./encode-buffer").EncodeBuffer;

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
  var encoder = this.encoder = new EncodeBuffer(options);
  encoder.push = function(chunk) {
    stream.push(chunk);
  };
  this._wrapValues = !!options.wrap;
}

EncodeStream.prototype._transform = function(chunk, encoding, callback) {
  try {
    if (this._wrapValues) {
      if (!chunk || typeof chunk !== "object" || !Object.prototype.hasOwnProperty.call(chunk, "value")) {
        throw new TypeError("Wrapped input must be an object with its own value property");
      }
      chunk = chunk.value;
    }
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
