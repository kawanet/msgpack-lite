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

Encoder.prototype.writeType = function(value) {
  var buffer = new Buffer(1);
  buffer.writeUInt8(value, 0);
  return this.write(buffer);
};

Encoder.prototype.writeUInt8 = writer(1, "writeUInt8");
Encoder.prototype.writeUInt16BE = writer(2, "writeUInt16BE");
Encoder.prototype.writeUInt32BE = writer(4, "writeUInt32BE");
Encoder.prototype.writeInt8 = writer(1, "writeInt8");
Encoder.prototype.writeInt16BE = writer(2, "writeInt16BE");
Encoder.prototype.writeInt32BE = writer(4, "writeInt32BE");
Encoder.prototype.writeDoubleBE = writer(8, "writeDoubleBE");

function writer(len, method) {
  len++;
  return function(type, value) {
    var buffer = new Buffer(len);
    buffer.writeUInt8(type, 0);
    buffer[method](value, 1);
    return this.write(buffer);
  };
}

Encoder.prototype.encode = function(value) {
  var type = typeof value;
  var func = this[type];
  if (!func) throw new Error("Unknown type: " + type);
  return func.call(this, value);
};

Encoder.prototype.undefined = function() {
  // nil -- 0xc0
  return this.writeType(0xc0);
};

Encoder.prototype.boolean = function(value) {
  // false -- 0xc2
  // true -- 0xc3
  return this.writeType(value ? 0xc3 : 0xc2);
};

Encoder.prototype.number = function(value) {
  var ivalue = value | 0;
  if (value !== ivalue - 0) {
    // float 64 -- 0xcb
    return this.writeDoubleBE(0xcb, value);
  }

  if (0 <= value) {
    // positive fixint -- 0x00 - 0x7f
    // uint 8 -- 0xcc
    // uint 16 -- 0xcd
    // uint 32 -- 0xce
    if (ivalue <= 0x7f) {
      return this.writeType(ivalue);
    } else if (ivalue <= 0xFF) {
      return this.writeUInt8(0xcc, ivalue);
    } else if (ivalue <= 0xFFFF) {
      return this.writeUInt16BE(0xcd, ivalue);
    } else {
      return this.writeUInt32BE(0xce, value);
    }
  } else {
    // negative fixint -- 0xe0 - 0xff
    // int 8 -- 0xd0
    // int 16 -- 0xd1
    // int 32 -- 0xd2
    // int 64 -- 0xd3
    if (-16 <= ivalue) {
      return this.writeType(256 + ivalue);
    } else if (-0x7F <= value) {
      return this.writeInt8(0xd0, ivalue);
    } else if (-0x7FFF <= value) {
      return this.writeInt16BE(0xd1, ivalue);
    } else {
      return this.writeInt32BE(0xd2, value);
    }
  }
};

Encoder.prototype.string = function(value) {
  // str 8 -- 0xd9
  // str 16 -- 0xda
  // str 32 -- 0xdb
  // fixstr -- 0xa0 - 0xbf
  var buffer = new Buffer(value, "utf-8");
  this.writeUInt32BE(0xdb, buffer.length);
  return this.write(buffer);
};

Encoder.prototype.object = function(value) {
  var that = this;
  var ret;
  var length;
  if (value === null) {
    return this.undefined();
  } else if (value instanceof Array) {
    // fixarray -- 0x90 - 0x9f
    // array 16 -- 0xdc
    // array 32 -- 0xdd
    length = value.length;
    if (length < 16) {
      ret = this.writeType(0x90 + length);
    } else if (length < 65536) {
      ret = this.writeUInt16BE(0xdc, length);
    } else {
      ret = this.writeUInt32BE(0xdd, length);
    }
    for (var i = 0; i < length; i++) {
      ret = that.encode(value[i]);
    }
    return ret;
  } else {
    // fixmap -- 0x80 - 0x8f
    // map 16 -- 0xde
    // map 32 -- 0xdf
    var keys = Object.keys(value);
    length = keys.length;
    if (length < 16) {
      ret = this.writeType(0x80 + length);
    } else if (length < 65536) {
      ret = this.writeUInt16BE(0xde, length);
    } else {
      ret = this.writeUInt32BE(0xdf, length);
    }
    keys.forEach(function(key) {
      that.encode(key);
      ret = that.encode(value[key]);
    });
    return ret;
  }
};
