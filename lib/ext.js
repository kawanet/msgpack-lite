// ext.js

var IS_ARRAY = require("isarray");

exports.createCodec = createCodec;

var ExtBuffer = require("./ext-buffer").ExtBuffer;
var ExtPreset = require("./ext-preset");
var ReadCore = require("./read-core");
var WriteCore = require("./write-core");

function Codec(options) {
  if (!(this instanceof Codec)) return new Codec(options);
  this.encode = WriteCore.getEncoder(options);
  this.decode = ReadCore.getDecoder(options);
  if (options && options.preset) {
    ExtPreset.setExtPreset(this);
  }
}

function createCodec(options) {
  return new Codec(options);
}

Codec.prototype.addExtPacker = function(etype, Class, packer) {
  if (IS_ARRAY(packer)) {
    packer = join(packer);
  }
  var name = Class.name;
  if (name && name !== "Object") {
    var packers = this.extPackers || (this.extPackers = {});
    packers[name] = extPacker;
  } else {
    // fallback for IE
    var list = this.extEncoderList || (this.extEncoderList = []);
    list.unshift([Class, extPacker]);
  }

  function extPacker(value) {
    var buffer = packer(value);
    return new ExtBuffer(buffer, etype);
  }
};

Codec.prototype.addExtUnpacker = function(etype, unpacker) {
  var unpackers = this.extUnpackers || (this.extUnpackers = []);
  unpackers[etype] = IS_ARRAY(unpacker) ? join(unpacker) : unpacker;
};

Codec.prototype.getExtPacker = function(value) {
  var packers = this.extPackers || (this.extPackers = {});
  var c = value.constructor;
  var e = c && c.name && packers[c.name];
  if (e) return e;

  // fallback for IE
  var list = this.extEncoderList || (this.extEncoderList = []);
  var len = list.length;
  for (var i = 0; i < len; i++) {
    var pair = list[i];
    if (c === pair[0]) return pair[1];
  }
};

Codec.prototype.getExtUnpacker = function(type) {
  var unpackers = this.extUnpackers || (this.extUnpackers = []);
  return unpackers[type] || extUnpacker;

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
