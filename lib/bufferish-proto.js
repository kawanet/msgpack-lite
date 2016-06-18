// bufferish-proto.js

/* jshint eqnull:true */

exports.copy = copy;
exports.slice = slice;
exports.readDoubleBE = gen("readDoubleBE");
exports.readFloatBE = gen("readFloatBE");
exports.writeDoubleBE = gen("writeDoubleBE");
exports.writeFloatBE = gen("writeFloatBE");

var Bufferish = require("./bufferish");
var BufferLite = require("./buffer-lite");

/**
 * @param target {Buffer|Uint8Array|Array}
 * @param [targetStart] {Number}
 * @param [start] {Number}
 * @param [end] {Number}
 * @returns {Buffer|Uint8Array|Array}
 */

function copy(target, targetStart, start, end) {
  var thisIsBuffer = Bufferish.isBuffer(this);
  var targetIsBuffer = Bufferish.isBuffer(target);
  if (thisIsBuffer && targetIsBuffer) {
    // Buffer to Buffer
    return this.copy(target, targetStart, start, end);
  } else if (!thisIsBuffer && !targetIsBuffer && Bufferish.isView(this) && Bufferish.isView(target)) {
    // Uint8Array to Uint8Array
    var buffer = (start || end != null) ? slice.call(this, start, end) : this;
    target.set(buffer, targetStart);
    return buffer.length;
  } else {
    // other cases
    return BufferLite.copy.call(this, target, targetStart, start, end);
  }
}

/**
 * @param [start] {Number}
 * @param [end] {Number}
 * @returns {Buffer|Uint8Array|Array}
 */

function slice(start, end) {
  var f = this.slice || this.subarray || Array.prototype.slice;
  if (f) return f.call(this, start, end);
}

/**
 * @private
 */

function gen(method) {
  return wrap;

  function wrap() {
    var f = this[method] || BufferLite[method];
    return f.apply(this, arguments);
  }
}
