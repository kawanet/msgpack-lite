// decode-buffer.js

exports.DecodeBuffer = DecodeBuffer;

var preset = require("./codec").codec.preset;

var BufferShortageError = require("./buffer-shortage").BufferShortageError;

function DecodeBuffer(options) {
  if (!(this instanceof DecodeBuffer)) return new DecodeBuffer(options);

  if (options) {
    this.options = options;
    if (options.codec) {
      this.codec = options.codec;
    }
  }
}

DecodeBuffer.prototype.offset = 0;

DecodeBuffer.prototype.push = function(chunk) {
  var buffers = this.buffers || (this.buffers = []);
  buffers.push(chunk);
};

DecodeBuffer.prototype.codec = preset;

DecodeBuffer.prototype.write = function(chunk) {
  var prev = this.offset ? this.buffer.slice(this.offset) : this.buffer;
  this.buffer = prev ? (chunk ? Buffer.concat([prev, chunk]) : prev) : chunk;
  this.offset = 0;
};

DecodeBuffer.prototype.read = function() {
  var length = this.buffers && this.buffers.length;

  // fetch the first result
  if (!length) return this.fetch();

  // flush current buffer
  this.flush();

  // read from the results
  return this.pull();
};

DecodeBuffer.prototype.pull = function() {
  var buffers = this.buffers || (this.buffers = []);
  return buffers.shift();
};

DecodeBuffer.prototype.fetch = function() {
  return this.codec.decode(this);
};

DecodeBuffer.prototype.flush = function() {
  while (this.offset < this.buffer.length) {
    var start = this.offset;
    var value;
    try {
      value = this.fetch();
    } catch (e) {
      if (!(e instanceof BufferShortageError)) throw e;
      // rollback
      this.offset = start;
      break;
    }
    this.push(value);
  }
};
