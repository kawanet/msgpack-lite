// ext.js

var IS_ARRAY = require("isarray");

exports.createCodec = createCodec;

var ExtBuffer = require("./ext-buffer").ExtBuffer;
var ExtPreset = require("./ext-preset");
var ReadCore = require("./read-core");
var WriteCore = require("./write-core");

function Codec(options) {
  if (!(this instanceof Codec)) return new Codec(options);
  this.extPackers = {};
  this.extUnpackers = [];
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
