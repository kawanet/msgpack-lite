// bufferish.js

var BufferProto = exports.prototype = require("./bufferish-proto");
exports.compat = require("./buffer-lite");

exports.alloc = alloc;
exports.concat = concat;

var hasBuffer = ("undefined" !== typeof Buffer);
var isBuffer = exports.isBuffer = hasBuffer && Buffer.isBuffer || _false;
var allocBuffer = hasBuffer && Buffer.alloc || _allocBuffer;

var hasArrayBuffer = ("undefined" !== typeof ArrayBuffer);
var isView = exports.isView = hasArrayBuffer && require("./arraybuffer-isview") || _false;

var isArray = exports.isArray = require("isarray");

/**
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

function _allocBuffer(size) {
  return new Buffer(size);
}

function _false() {
  return false;
}