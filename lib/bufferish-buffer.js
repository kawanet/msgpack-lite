// bufferish-buffer.js

var Bufferish = require("./bufferish");
var Buffer = Bufferish.global;

var exports = module.exports = Buffer ? Buffer.alloc(0) : [];

exports.alloc = Buffer && Buffer.alloc;
exports.concat = Bufferish.concat;
exports.from = from;

/**
 * @param value {Array|ArrayBuffer|Buffer|String}
 * @returns {Buffer}
 */

function from(value) {
  if (!Bufferish.isBuffer(value) && Bufferish.isView(value)) {
    // TypedArray to Uint8Array
    value = Bufferish.Uint8Array.from(value);
  } else if (Bufferish.isArrayBuffer(value)) {
    // ArrayBuffer to Uint8Array
    value = new Uint8Array(value);
  } else if (typeof value === "string") {
    // String to Buffer
    return Bufferish.from.call(exports, value);
  } else if (typeof value === "number") {
    throw new TypeError('"value" argument must not be a number');
  }

  // Array-like to Buffer
  return Buffer.from(value); // node v4.5+
}
