// encode-buffer.js

exports.EncodeBuffer = EncodeBuffer;

var preset = require("./codec").codec.preset;

var MIN_BUFFER_SIZE = 2048;
var MAX_BUFFER_SIZE = 65536;

function EncodeBuffer(options) {
  if (!(this instanceof EncodeBuffer)) return new EncodeBuffer(options);

  if (options) {
    this.options = options;
    if (options.codec) {
      this.codec = options.codec;
    }
  }
}

EncodeBuffer.prototype.offset = 0;
EncodeBuffer.prototype.start = 0;

EncodeBuffer.prototype.push = function(chunk) {
  var buffers = this.buffers || (this.buffers = []);
  buffers.push(chunk);
};

EncodeBuffer.prototype.codec = preset;

EncodeBuffer.prototype.write = function(input) {
  this.codec.encode(this, input);
};

EncodeBuffer.prototype.read = function() {
  var length = this.buffers && this.buffers.length;

  // fetch the first result
  if (!length) return this.fetch();

  // flush current buffer
  this.flush();

  // read from the results
  return this.pull();
};

EncodeBuffer.prototype.pull = function() {
  var buffers = this.buffers || (this.buffers = []);
  var chunk = buffers.length > 1 ? Buffer.concat(buffers) : buffers[0];
  buffers.length = 0; // buffer exhausted
  return chunk;
};

EncodeBuffer.prototype.fetch = function() {
  var start = this.start;
  if (start < this.offset) {
    this.start = this.offset;
    return this.buffer.slice(start, this.offset);
  }
};

EncodeBuffer.prototype.flush = function() {
  var buffer = this.fetch();
  if (buffer) this.push(buffer);
};

EncodeBuffer.prototype.reserve = function(length) {
  if (this.buffer) {
    var size = this.buffer.length;

    // is it long enough?
    if (this.offset + length < size) return;

    // flush current buffer
    this.flush();

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
