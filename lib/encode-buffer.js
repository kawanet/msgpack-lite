// encode-buffer.js

exports.EncodeBuffer = EncodeBuffer;

var preset = require("./ext-preset").preset;
var MIN_BUFFER_SIZE = 2048;
var MAX_BUFFER_SIZE = 65536;
var DEFAULT_OPTIONS = {};

function EncodeBuffer(options) {
  if (!(this instanceof EncodeBuffer)) return new EncodeBuffer(options);
  this.options = options || DEFAULT_OPTIONS;
  this.codec = this.options.codec || preset;
}

EncodeBuffer.prototype.push = function(chunk) {
  var buffers = this.buffers || (this.buffers = []);
  buffers.push(chunk);
};

EncodeBuffer.prototype.read = function() {
  this.flush();
  var buffers = this.buffers;
  if (!buffers) return;
  var chunk = buffers.length > 1 ? Buffer.concat(buffers) : buffers[0];
  buffers.length = 0;
  return chunk;
};

EncodeBuffer.prototype.flush = function() {
  if (this.start < this.offset) {
    this.push(this.buffer.slice(this.start, this.offset));
    this.start = this.offset;
  }
};

EncodeBuffer.prototype.reserve = function(length) {
  if (!this.buffer) return this.alloc(length);

  var size = this.buffer.length;

  // is it long enough?
  if (this.offset + length < size) return;

  // flush current buffer
  if (this.offset) this.flush();

  // resize it to 2x current length
  this.alloc(Math.max(length, Math.min(size * 2, MAX_BUFFER_SIZE)));
};

EncodeBuffer.prototype.alloc = function(length) {
  // allocate new buffer
  this.buffer = new Buffer(length > MIN_BUFFER_SIZE ? length : MIN_BUFFER_SIZE);
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
