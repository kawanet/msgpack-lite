// ext.js

var IS_ARRAY = require("isarray");

exports.Ext = Codec; // compatibility
exports.Codec = Codec;
exports.createCodec = createCodec;

var ExtBuffer = require("./ext-buffer").ExtBuffer;
var readUint8 = require("./read-format").format.uint8;
var ReadToken = require("./read-token");
var WriteType = require("./write-type");

function Codec() {
  if (!(this instanceof Codec)) return new Codec();
  this.extPackers = {};
  this.extUnpackers = [];
}

function createCodec() {
  return new Codec();
}

Codec.prototype.extend = function() {
  var codec = extend(this);
  codec.extPackers = extend(this.extPackers);
  codec.extUnpackers = extend(this.extUnpackers);
  return codec;
};

Codec.prototype.setReadToken = function(readToken) {
  this._decode = _decode;

  function _decode() {
    var type = readUint8(this);
    var func = readToken[type];
    if (!func) throw new Error("Invalid type: " + (type ? ("0x" + type.toString(16)) : type));
    return func(this);
  }
};

Codec.prototype.setWriteType = function(writeType) {
  this._encode = _encode;

  function _encode(value) {
    var func = writeType[typeof value];
    if (!func) throw new Error("Unsupported type \"" + (typeof value) + "\": " + value);
    func(this, value);
  }
};

Codec.prototype.addExtPacker = function(etype, Class, packer) {
  if (IS_ARRAY(packer)) {
    packer = join(packer);
  }
  var name = Class.name;
  if (name && name !== "Object") {
    this.extPackers[name] = extPacker;
  } else {
    var list = this.extEncoderList || (this.extEncoderList = []);
    list.unshift([Class, extPacker]);
  }

  function extPacker(value) {
    var buffer = packer(value);
    return new ExtBuffer(buffer, etype);
  }
};

Codec.prototype.addExtUnpacker = function(etype, unpacker) {
  this.extUnpackers[etype] = IS_ARRAY(unpacker) ? join(unpacker) : unpacker;
};

Codec.prototype.getExtPacker = function(value) {
  var c = value.constructor;
  var e = c && c.name && this.extPackers[c.name];
  if (e) return e;
  var list = this.extEncoderList;
  if (!list) return;
  var len = list.length;
  for (var i = 0; i < len; i++) {
    var pair = list[i];
    if (c === pair[0]) return pair[1];
  }
};

Codec.prototype.getExtUnpacker = function(type) {
  return this.extUnpackers[type] || extUnpacker;

  function extUnpacker(buffer) {
    return new ExtBuffer(buffer, type);
  }
};

function join(filters) {
  filters = filters.slice();

  return function(value) {
    return filters.reduce(iterator, value);
  };

  function iterator(value, filter) {
    return filter(value);
  }
}

function extend(source) {
  Extended.prototype = source;
  return new Extended();

  function Extended() {
  }
}

// initialize default

Codec.prototype.setReadToken(ReadToken.token);
Codec.prototype.setWriteType(WriteType.type);
