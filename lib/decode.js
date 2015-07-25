// decode.js

exports.decode = function(input, output) {
  var decoder = new Decoder(input, output);
  return decoder.decodeStream();
};

function Decoder(input, output) {
  // output Stream
  this.output = output;

  if (input instanceof Buffer) {
    // input Buffer
    this.initBuffer(input);
  } else {
    // input Stream
    input.on("data", this.onData.bind(this));
    if (output) {
      input.on("end", output.emit.bind(output, "end"));
    }
  }
}

Decoder.prototype.initBuffer = function(buffer) {
  this.buffer = buffer;
  this.bufferLength = buffer.length;
  this.offset = 0;
};

Decoder.prototype.onData = function(chunk) {
  if (!this.buffer) {
    // first chunk
    this.initBuffer(chunk);
  } else {
    // later chunk
    var prev = this.offset ? this.buffer.slice(this.offset) : this.buffer;
    this.buffer = Buffer.concat([prev, chunk]);
    this.bufferLength = this.buffer.length;
    this.offset = 0;
  }
  if (this.output) {
    // try to decode
    this.decodeStream();
  }
};

Decoder.prototype.decodeStream = function() {
  if (!this.bufferLength) return;
  var value = this.decode();
  if (value === BUFFER_SHORTAGE) return;
  if (this.output) {
    this.output.write(value);
    return this.decodeStream();
  }
  return value;
};

Decoder.prototype.decode = function() {
  var type = uint8.call(this);
  if (type === BUFFER_SHORTAGE) return type;
  var func = token[type];
  if (!func) throw new Error("Invalid MessagePack token: 0x" + (type.toString(16)));
  return func.call(this);
};

var token = {};
var uint8 = read(1, Buffer.prototype.readUInt8);

init();

function init() {
  var i;

  var uint16 = read(2, Buffer.prototype.readUInt16BE);
  var uint32 = read(4, Buffer.prototype.readUInt32BE);
  var uint64 = fix(8, ext); // TODO
  var int8 = read(1, Buffer.prototype.readInt8);
  var int16 = read(2, Buffer.prototype.readInt16BE);
  var int32 = read(4, Buffer.prototype.readInt32BE);
  var int64 = fix(8, ext); // TODO
  var float32 = read(4, Buffer.prototype.readFloatBE);
  var float64 = read(8, Buffer.prototype.readDoubleBE);

  // positive fixint -- 0x00 - 0x7f
  for (i = 0x00; i <= 0x7f; i++) {
    token[i] = constant(i);
  }

  // fixmap -- 0x80 - 0x8f
  for (i = 0x80; i <= 0x8f; i++) {
    token[i] = fix(i - 0x80, map);
  }

  // fixarray -- 0x90 - 0x9f
  for (i = 0x90; i <= 0x9f; i++) {
    token[i] = fix(i - 0x90, array);
  }

  // fixstr -- 0xa0 - 0xbf
  for (i = 0xa0; i <= 0xbf; i++) {
    token[i] = fix(i - 0xa0, str);
  }

  // nil -- 0xc0
  token[0xc0] = constant(null);

  // (never used) -- 0xc1
  token[0xc1] = constant(new Error("Invalid MessagePack token: 0xC1"));

  // false -- 0xc2
  // true -- 0xc3
  token[0xc2] = constant(false);
  token[0xc3] = constant(true);

  // bin 8 -- 0xc4
  // bin 16 -- 0xc5
  // bin 32 -- 0xc6
  token[0xc4] = flex(uint8, ext);
  token[0xc5] = flex(uint16, ext);
  token[0xc6] = flex(uint32, ext);

  // ext 8 -- 0xc7
  // ext 16 -- 0xc8
  // ext 32 -- 0xc9
  token[0xc7] = flex(uint8, ext);
  token[0xc8] = flex(uint16, ext);
  token[0xc9] = flex(uint32, ext);

  // float 32 -- 0xca
  // float 64 -- 0xcb
  token[0xca] = float32;
  token[0xcb] = float64;

  // uint 8 -- 0xcc
  // uint 16 -- 0xcd
  // uint 32 -- 0xce
  // uint 64 -- 0xcf
  token[0xcc] = uint8;
  token[0xcd] = uint16;
  token[0xce] = uint32;
  token[0xcf] = uint64;

  // int 8 -- 0xd0
  // int 16 -- 0xd1
  // int 32 -- 0xd2
  // int 64 -- 0xd3
  token[0xd0] = int8;
  token[0xd1] = int16;
  token[0xd2] = int32;
  token[0xd3] = int64;

  // ext 1 -- 0xd4
  // ext 2 -- 0xd5
  // ext 4 -- 0xd6
  // ext 8 -- 0xd7
  // ext 16 -- 0xd8
  token[0xd4] = fix(1, ext);
  token[0xd5] = fix(2, ext);
  token[0xd6] = fix(4, ext);
  token[0xd7] = fix(8, ext);
  token[0xd8] = fix(16, ext);

  // str 8 -- 0xd9
  // str 16 -- 0xda
  // str 32 -- 0xdb
  // array 16 -- 0xdc
  // array 32 -- 0xdd
  // map 16 -- 0xde
  // map 32 -- 0xdf
  token[0xd9] = flex(uint8, str);
  token[0xda] = flex(uint16, str);
  token[0xdb] = flex(uint32, str);
  token[0xdc] = flex(uint16, array);
  token[0xdd] = flex(uint32, array);
  token[0xde] = flex(uint16, map);
  token[0xdf] = flex(uint32, map);

  // negative fixint -- 0xe0 - 0xff
  for (i = 0xe0; i <= 0xff; i++) {
    token[i] = constant(i - 0x100);
  }
}

function constant(value) {
  return function() {
    return value;
  };
}

function flex(lenFunc, decodeFunc) {
  return function() {
    var len = lenFunc.call(this);
    return decodeFunc.call(this, len);
  };
}

function fix(len, method) {
  return function() {
    return method.call(this, len);
  };
}

function map(len) {
  var value = {};
  for (var i = 0; i < len; i++) {
    var key = this.decode();
    value[key] = this.decode();
  }
  return value;
}

function array(len) {
  var value = [];
  for (var i = 0; i < len; i++) {
    value.push(this.decode());
  }
  return value;
}

function str(len) {
  var start = this.offset;
  var end = start + len;
  if (end > this.bufferLength) return BUFFER_SHORTAGE;
  this.offset = end;
  return this.buffer.toString("utf-8", start, end);
}

function read(len, method) {
  return function() {
    var start = this.offset;
    var end = start + len;
    if (end > this.bufferLength) return BUFFER_SHORTAGE;
    var value = method.call(this.buffer, start);
    this.offset = end;
    return value;
  };
}

function ext(len) {
  var start = this.offset;
  var end = start + len;
  if (end > this.bufferLength) return BUFFER_SHORTAGE;
  var buf = this.buffer.slice(start, end);
  this.offset = end;
  return buf;
}

function BUFFER_SHORTAGE() {
}