// bufferish-proto.js

/* jshint eqnull:true */

var BufferLite = require("./buffer-lite");

exports.copy = copy;
exports.readDoubleBE = gen("readDoubleBE");
exports.readFloatBE = gen("readFloatBE");
exports.readInt64BE = BufferLite.readInt64BE;
exports.readUInt64BE = BufferLite.readUInt64BE;
exports.slice = slice;
exports.toString = toString;
exports.write = gen("write");
exports.writeDoubleBE = gen("writeDoubleBE");
exports.writeFloatBE = gen("writeFloatBE");
exports.writeInt64BE = BufferLite.writeInt64BE;
exports.writeUInt64BE = BufferLite.writeUInt64BE;

var Bufferish = require("./bufferish");

var hasBuffer = ("undefined" !== typeof Buffer);
var isBufferShim = hasBuffer && ("TYPED_ARRAY_SUPPORT" in Buffer);

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
 * Buffer.prototype.toString()
 *
 * @param [encoding] {String} ignored
 * @param [start] {Number}
 * @param [end] {Number}
 * @returns {String}
 */

function toString(encoding, start, end) {
  var f = (!isBufferShim && Buffer.isBuffer(this)) ? this.toString : BufferLite.toString;
  return f.apply(this, arguments);
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
