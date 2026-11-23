/*global BigInt */

// Keep syntax compatible with runtimes without BigInt. No integer literals
// with an `n` suffix may appear in the source or browser bundle.
var available = ("function" === typeof BigInt);
var ZERO = available && BigInt(0);
var BYTE = available && BigInt(256);
var TWO64 = available && BigInt("18446744073709551616");
var MIN = available && BigInt("-9223372036854775808");

exports.available = available;
exports.toArray = toArray;
exports.read = read;

function toArray(value) {
  if (value < MIN || value >= TWO64) {
    throw new RangeError("BigInt is outside the MessagePack int64/uint64 range");
  }
  if (value < ZERO) value += TWO64;
  var bytes = new Array(8);
  for (var i = 7; i >= 0; i--) {
    bytes[i] = Number(value % BYTE);
    value /= BYTE;
  }
  return bytes;
}

function read(buffer, start, signed) {
  var value = ZERO;
  for (var i = 0; i < 8; i++) {
    value = value * BYTE + BigInt(buffer[start + i]);
  }
  return signed && (buffer[start] & 0x80) ? value - TWO64 : value;
}
