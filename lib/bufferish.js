// bufferish.js

var BufferProto = exports.prototype = require("./bufferish-proto");
exports.compat = require("./buffer-lite");

exports.alloc = alloc;
exports.concat = concat;
exports.from = from;

var hasBuffer = ("undefined" !== typeof Buffer);
var isBuffer = exports.isBuffer = hasBuffer && Buffer.isBuffer || _false;
var allocBuffer = hasBuffer && Buffer.alloc || _allocBuffer;

var hasArrayBuffer = ("undefined" !== typeof ArrayBuffer);
var isView = exports.isView = hasArrayBuffer && require("./arraybuffer-isview") || _false;

var isArray = exports.isArray = require("isarray");

/**
 * - Class Method: Buffer.from(array)
 * - Class Method: Buffer.from(arrayBuffer)
 * - Class Method: Buffer.from(buffer)
 * - Class Method: Buffer.from(str)
 *
 * @param value {Array|ArrayBuffer|Buffer|String}
 * @returns {Buffer|Uint8Array|Array}
 */

function from(value) {
  if (typeof value === "number") {
    throw new TypeError('"value" argument must not be a number');
  } else if (typeof value === "string") {
    return _fromString.call(this, value);
  }

  var refBuffer = hasBuffer && isBuffer(this);
  var refUint8Array = !refBuffer && hasArrayBuffer && isView(this);

  // TypedArray to ArrayBuffer
  if (!isBuffer(value) && isView(value)) {
    var byteOffset = value.byteOffset;
    var byteLength = value.byteLength;
    value = value.buffer;
    if (value.byteLength !== byteLength) {
      value = value.slice(byteOffset, byteOffset + byteLength);
    }
  }

  // Array-like or ArrayBuffer to Uint8Array
  if (refUint8Array) {
    return new Uint8Array(value);
  }

  // ArrayBuffer to Uint8Array
  if (hasArrayBuffer && value instanceof ArrayBuffer) {
    value = new Uint8Array(value);
  }

  // Array-like to Array or Buffer
  if (!refBuffer) {
    return Array.prototype.slice.call(value);
  } else if (Buffer.from && Buffer.from.length !== 1) {
    return Buffer.from(value); // node v6+
  } else {
    return new Buffer(value); // node v4
  }
}

/**
 * - Class Method: Buffer.alloc(size)
 *
 * @param size {Number}
 * @returns {Buffer|Uint8Array|Array}
 */

function alloc(size) {
  if (isBuffer(this)) return allocBuffer(size);
  if (isView(this)) return new Uint8Array(size);
  if (isArray(this)) return new Array(size);
  if (hasBuffer) return allocBuffer(size);
  if (hasArrayBuffer) return new Uint8Array(size);
  return new Array(size);
}

/**
 * - Class Method: Buffer.concat(list[, totalLength])
 *
 * @param list {Array} array of (Buffer|Uint8Array|Array)s
 * @param [length]
 * @returns {Buffer|Uint8Array|Array}
 */

function concat(list, length) {
  if (!length) {
    length = 0;
    Array.prototype.forEach.call(list, dryrun);
  }
  var ref = (this !== exports) && this || list[0];
  var result = alloc.call(ref, length);
  var offset = 0;
  Array.prototype.forEach.call(list, append);
  return result;

  function dryrun(buffer) {
    length += buffer.length;
  }

  function append(buffer) {
    offset += BufferProto.copy.call(buffer, result, offset);
  }
}

/**
 * @private
 */

function _fromString(value) {
  var expected = value.length * 3;
  var that = alloc.call(this, expected);
  var actual = BufferProto.write.call(that, value);
  if (expected !== actual) {
    that = BufferProto.slice.call(that, 0, actual);
  }
  return that;
}

function _allocBuffer(size) {
  return new Buffer(size);
}

function _false() {
  return false;
}