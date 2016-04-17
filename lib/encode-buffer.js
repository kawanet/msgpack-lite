// encode-buffer.js

exports.EncodeBuffer = EncodeBuffer;

var encode = require("./write-core").encode;
var preset = require("./ext-preset").preset;

var MIN_BUFFER_SIZE = 2048;
var MAX_BUFFER_SIZE = 65536;
var DEFAULT_OPTIONS = {};

function EncodeBuffer(options) {
  if (!(this instanceof EncodeBuffer)) return new EncodeBuffer(options);
  this.options = options || DEFAULT_OPTIONS;
  this.codec = this.options.codec || preset;
}

EncodeBuffer.prototype.start = 0;
EncodeBuffer.prototype.offset = 0;
EncodeBuffer.prototype.length = 0;
EncodeBuffer.prototype.push = Array.prototype.push;

EncodeBuffer.prototype._encode = function(input) {
  encode(this, input);
};

EncodeBuffer.prototype.write = function(input) {
  this._encode(input);
};

EncodeBuffer.prototype.read = function() {
  this.flush();
  return this.length > 1 ? Buffer.concat(Array.prototype.splice.call(this, 0)) : Array.prototype.shift.call(this);
};

EncodeBuffer.prototype.flush = function() {
  if (this.start < this.offset) {
    this.push(this.buffer.slice(this.start, this.offset));
    this.start = this.offset;
  }
};

EncodeBuffer.prototype.reserve = function(length) {
  if (this.buffer) {
    var size = this.buffer.length;

    // is it long enough?
    if (this.offset + length < size) return;

    // flush current buffer
    if (this.offset) this.flush();

    // resize it to 2x current length
    length = Math.max(length, Math.min(size * 2, MAX_BUFFER_SIZE));
  }

  // minimum buffer size
  length = length > MIN_BUFFER_SIZE ? length : MIN_BUFFER_SIZE;

  // allocate new buffer
  this.buffer = new Buffer(length);
  this.start = 0;
  this.offset = 0;
};

EncodeBuffer.prototype.send = function(buffer) {
  var end = this.offset + buffer.length;
  if (this.buffer && end < this.buffer.length) {
    buffer.copy(this.buffer, this.offset);
    this.offset = end;
  } else {
    this.flush();
    this.push(buffer);
  }
};
