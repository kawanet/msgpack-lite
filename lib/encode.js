// encode.js

exports.encode = function(value, stream) {
  var tempStream;
  if (!stream) {
    tempStream = stream = [];
    stream.write = stream.push.bind(stream);
  }
  var encoder = new Encoder(stream);
  encoder.encode(value);
  return tempStream ? Buffer.concat(tempStream) : stream;
};

function Encoder(stream) {
  this.write = stream.write.bind(stream);
}

init(Encoder.prototype);

function init(encoder) {
  var i;

  // positive fixint -- 0x00 - 0x7f
  // nil -- 0xc0
  // false -- 0xc2
  // true -- 0xc3
  // negative fixint -- 0xe0 - 0xff
  for (i = 0x00; i <= 0xFF; i++) {
    encoder[i] = constant(i);
  }

  // bin 8 -- 0xc4
  // bin 16 -- 0xc5
  // bin 32 -- 0xc6
  encoder[0xc4] = writer(0xc4, 1, "writeUInt8");
  encoder[0xc5] = writer(0xc5, 2, "writeUInt16BE");
  encoder[0xc6] = writer(0xc6, 4, "writeUInt32BE");

  // ext 8 -- 0xc7
  // ext 16 -- 0xc8
  // ext 32 -- 0xc9
  encoder[0xc7] = writer(0xc7, 1, "writeUInt8");
  encoder[0xc8] = writer(0xc8, 2, "writeUInt16BE");
  encoder[0xc9] = writer(0xc9, 4, "writeUInt32BE");

  // float 32 -- 0xca
  // float 64 -- 0xcb
  encoder[0xca] = writer(0xca, 4, "writeFloatBE");
  encoder[0xcb] = writer(0xcb, 8, "writeDoubleBE");

  // uint 8 -- 0xcc
  // uint 16 -- 0xcd
  // uint 32 -- 0xce
  // uint 64 -- 0xcf
  encoder[0xcc] = writer(0xcc, 1, "writeUInt8");
  encoder[0xcd] = writer(0xcd, 2, "writeUInt16BE");
  encoder[0xce] = writer(0xce, 4, "writeUInt32BE");
  encoder[0xcf] = writer(0xcf, 8);

  // int 8 -- 0xd0
  // int 16 -- 0xd1
  // int 32 -- 0xd2
  // int 64 -- 0xd3
  encoder[0xd0] = writer(0xd0, 1, "writeInt8");
  encoder[0xd1] = writer(0xd1, 2, "writeInt16BE");
  encoder[0xd2] = writer(0xd2, 4, "writeInt32BE");
  encoder[0xd3] = writer(0xd3, 8);

  // str 8 -- 0xd9
  // str 16 -- 0xda
  // str 32 -- 0xdb
  // array 16 -- 0xdc
  // array 32 -- 0xdd
  // map 16 -- 0xde
  // map 32 -- 0xdf
  encoder[0xd9] = writer(0xd9, 1, "writeUInt8");
  encoder[0xda] = writer(0xda, 2, "writeUInt16BE");
  encoder[0xdb] = writer(0xdb, 4, "writeUInt32BE");
  encoder[0xdc] = writer(0xdc, 2, "writeUInt16BE");
  encoder[0xdd] = writer(0xdd, 4, "writeUInt32BE");
  encoder[0xde] = writer(0xde, 2, "writeUInt16BE");
  encoder[0xdf] = writer(0xdf, 4, "writeUInt32BE");
}

function constant(value) {
  return function() {
    var buffer = new Buffer(1);
    buffer.writeUInt8(value, 0);
    return this.write(buffer);
  };
}

function writer(type, len, method) {
  len++;
  return function(value) {
    var buffer = new Buffer(len);
    buffer.writeUInt8(type, 0);
    if (method) buffer[method](value, 1);
    return this.write(buffer);
  };
}

var types = {
  undefined: Encoder.prototype[0xc0],
  boolean: boolean,
  number: number,
  string: string,
  object: object
};

Encoder.prototype.encode = function(value) {
  var type = typeof value;
  var func = types[type];
  if (!func) throw new Error("Unknown type: " + type);
  return func.call(this, value);
};

// false -- 0xc2
// true -- 0xc3
function boolean(value) {
  var type = value ? 0xc3 : 0xc2;
  return this[type](value);
}

function number(value) {
  var ivalue = value | 0;
  var type;
  if (value !== ivalue - 0) {
    // float 64 -- 0xcb
    type = 0xcb;
  } else if (0 <= ivalue) {
    // positive fixint -- 0x00 - 0x7f
    // uint 8 -- 0xcc
    // uint 16 -- 0xcd
    // uint 32 -- 0xce
    type = (ivalue <= 0x7f) ? ivalue : (ivalue <= 0xFF) ? 0xcc : (ivalue <= 0xFFFF) ? 0xcd : 0xce;
  } else {
    // negative fixint -- 0xe0 - 0xff
    // int 8 -- 0xd0
    // int 16 -- 0xd1
    // int 32 -- 0xd2
    // int 64 -- 0xd3
    type = (-16 <= ivalue) ? (256 + ivalue) : (-0x7F <= ivalue) ? 0xd0 : (-0x7FFF <= ivalue) ? 0xd1 : 0xd2;
  }
  return this[type](value);
}

function string(value) {
  // str 8 -- 0xd9
  // str 16 -- 0xda
  // str 32 -- 0xdb
  // fixstr -- 0xa0 - 0xbf
  var buffer = new Buffer(value, "utf-8");
  var length = buffer.length;
  var type = (length < 32) ? (0xa0 + length) : (length <= 0xFF) ? 0xd9 : (length <= 0xFFFF) ? 0xda : 0xdb;
  this[type](length);
  return this.write(buffer);
}

function object(value) {
  var that = this;
  var type;
  var ret;
  var length;
  if (value === null) {
    // nil -- 0xc0
    type = 0xc0;
    ret = that[type](value);
  } else if (value instanceof Array) {
    // fixarray -- 0x90 - 0x9f
    // array 16 -- 0xdc
    // array 32 -- 0xdd
    length = value.length;
    type = (length < 16) ? (0x90 + length) : (length <= 0xFFFF) ? 0xdc : 0xdd;
    ret = that[type](length);
    for (var i = 0; i < length; i++) {
      ret = that.encode(value[i]);
    }
  } else {
    // fixmap -- 0x80 - 0x8f
    // map 16 -- 0xde
    // map 32 -- 0xdf
    var keys = Object.keys(value);
    length = keys.length;
    type = (length < 16) ? (0x80 + length) : (length <= 0xFFFF) ? 0xde : 0xdf;
    ret = that[type](length);
    keys.forEach(function(key) {
      that.encode(key);
      ret = that.encode(value[key]);
    });
  }
  return ret;
}
