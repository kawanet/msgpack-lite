// MessagePack's reserved timestamp extension (type -1 / 0xff).
var Bufferish = require("./bufferish");
var TWO32 = 0x100000000;
var TWO34 = 0x400000000;

exports.pack = pack;
exports.unpack = unpack;

function read32(buffer, offset) {
  return buffer[offset] * 0x1000000 + buffer[offset + 1] * 0x10000 +
    buffer[offset + 2] * 0x100 + buffer[offset + 3];
}

function write32(buffer, offset, value) {
  buffer[offset] = value >>> 24;
  buffer[offset + 1] = (value >>> 16) & 0xff;
  buffer[offset + 2] = (value >>> 8) & 0xff;
  buffer[offset + 3] = value & 0xff;
}

function pack(date) {
  var milliseconds = date.getTime();
  if (!isFinite(milliseconds)) throw new RangeError("Cannot encode an invalid Date as a timestamp");
  var seconds = Math.floor(milliseconds / 1000);
  var nanoseconds = (milliseconds - seconds * 1000) * 1000000;
  var buffer;
  if (nanoseconds === 0 && seconds >= 0 && seconds < TWO32) {
    buffer = Bufferish.alloc(4);
    write32(buffer, 0, seconds);
  } else if (seconds >= 0 && seconds < TWO34) {
    buffer = Bufferish.alloc(8);
    write32(buffer, 0, nanoseconds * 4 + Math.floor(seconds / TWO32));
    write32(buffer, 4, seconds % TWO32);
  } else {
    buffer = Bufferish.alloc(12);
    var high = Math.floor(seconds / TWO32);
    write32(buffer, 0, nanoseconds);
    write32(buffer, 4, high);
    write32(buffer, 8, seconds - high * TWO32);
  }
  return buffer;
}

function unpack(buffer) {
  var seconds;
  var nanoseconds = 0;
  var high;
  if (buffer.length === 4) {
    seconds = read32(buffer, 0);
  } else if (buffer.length === 8) {
    high = read32(buffer, 0);
    nanoseconds = Math.floor(high / 4);
    seconds = (high & 3) * TWO32 + read32(buffer, 4);
  } else if (buffer.length === 12) {
    nanoseconds = read32(buffer, 0);
    high = read32(buffer, 4);
    // The 96-bit form carries signed seconds; bitwise shifts cannot express
    // the complete value in JavaScript, but Date's range fits in a Number.
    if (high >= 0x80000000) high -= TWO32;
    seconds = high * TWO32 + read32(buffer, 8);
  } else {
    throw new RangeError("Invalid timestamp length: " + buffer.length);
  }
  if (nanoseconds >= 1000000000) throw new RangeError("Invalid timestamp nanoseconds");
  var date = new Date(seconds * 1000 + nanoseconds / 1000000);
  if (!isFinite(date.getTime())) throw new RangeError("Timestamp is outside the Date range");
  return date;
}
