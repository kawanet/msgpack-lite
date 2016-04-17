// decode-buffer.js

exports.DecodeBuffer = DecodeBuffer;

var decode = require("./read-core").decode;
var preset = require("./ext-preset").preset;

var BUFFER_SHORTAGE = require("./common").BUFFER_SHORTAGE;
var DEFAULT_OPTIONS = {};

function DecodeBuffer(options) {
  if (!(this instanceof DecodeBuffer)) return new DecodeBuffer(options);
  this.options = options || DEFAULT_OPTIONS;
  this.codec = this.options.codec || preset;
}

DecodeBuffer.prototype.offset = 0;
DecodeBuffer.prototype.length = 0;
DecodeBuffer.prototype.push = Array.prototype.push;

DecodeBuffer.prototype._decode = function() {
  return decode(this);
};

DecodeBuffer.prototype.write = function(chunk) {
  var prev = this.offset ? this.buffer.slice(this.offset) : this.buffer;
  this.buffer = prev ? (chunk ? Buffer.concat([prev, chunk]) : prev) : chunk;
  this.offset = 0;
};

DecodeBuffer.prototype.read = function() {
  if (!this.length) this.flush();
  return Array.prototype.shift.call(this);
};

DecodeBuffer.prototype.flush = function() {
  while (this.offset < this.buffer.length) {
    var start = this.offset;
    var value;
    try {
      value = this._decode();
    } catch (e) {
      if (e !== BUFFER_SHORTAGE) throw e;
      // rollback
      this.offset = start;
      break;
    }
    this.push(value);
  }
};
