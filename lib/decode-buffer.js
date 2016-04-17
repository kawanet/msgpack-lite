// decode-buffer.js

exports.DecodeBuffer = DecodeBuffer;

var decode = require("./read-core").decode;
var decodeAsync = require("./read-core").decodeAsync;
var preset = require("./ext-preset").preset;

var DEFAULT_OPTIONS = {};

function DecodeBuffer(options) {
  if (!(this instanceof DecodeBuffer)) return new DecodeBuffer(options);
  this.options = options || DEFAULT_OPTIONS;
  this.codec = this.options.codec || preset;
}

DecodeBuffer.prototype.offset = 0;
DecodeBuffer.prototype.length = 0;
DecodeBuffer.prototype.push = Array.prototype.push;

DecodeBuffer.prototype.write = function(chunk) {
  var prev = this.offset ? this.buffer.slice(this.offset) : this.buffer;
  this.buffer = prev ? (chunk ? Buffer.concat([prev, chunk]) : prev) : chunk;
  this.offset = 0;
};

DecodeBuffer.prototype.read = function() {
  return this.length ? Array.prototype.shift.call(this) : decode(this);
};

DecodeBuffer.prototype.flush = function() {
  decodeAsync(this);
};
