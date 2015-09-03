// decode-buffer.js

exports.DecodeBuffer = DecodeBuffer;

var DEFAULT_OPTIONS = {};

function DecodeBuffer(options) {
  if (!(this instanceof DecodeBuffer)) return new DecodeBuffer(options);
  this.options = options || DEFAULT_OPTIONS;
}

DecodeBuffer.prototype.push = Array.prototype.push;
DecodeBuffer.prototype.read = Array.prototype.shift;

DecodeBuffer.prototype.append = function(chunk) {
  var prev = this.offset ? this.buffer.slice(this.offset) : this.buffer;
  this.buffer = prev ? Buffer.concat([prev, chunk]) : chunk;
  this.offset = 0;
};
