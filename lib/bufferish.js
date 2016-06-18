// bufferish.js

var BufferProto = exports.prototype = require("./bufferish-proto");
exports.compat = require("./buffer-lite");

exports.alloc = alloc;
exports.concat = concat;

var hasBuffer = ("undefined" !== typeof Buffer);
var isBuffer = exports.isBuffer = hasBuffer && Buffer.isBuffer || _false;

var hasArrayBuffer = ("undefined" !== typeof ArrayBuffer);
var isView = exports.isView = hasArrayBuffer && require("./arraybuffer-isview");

var isArray = exports.isArray = require("isarray");

/**
 * @param size {Number}
 * @returns {Buffer|Uint8Array|Array}
 */

function alloc(size) {
  return isBuffer(this) ? (Buffer.alloc ? Buffer.alloc(size) : new Buffer(size))
    : isView(this) ? new Uint8Array(size)
    : isArray(this) ? new Array(size)
    : hasBuffer ? (Buffer.alloc ? Buffer.alloc(size) : new Buffer(size))
    : hasArrayBuffer ? new Uint8Array(size)
    : new Array(size);
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

function _false() {
  return false;
}