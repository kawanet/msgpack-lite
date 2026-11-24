var {it} = require("node:test");
var assert = require("node:assert").strict;
var msgpack = require("../index");

it("does not mistake Object prototype names for registered packers", function() {
  var Classes = [function toString() { this.value = 1; }, function valueOf() { this.value = 2; }];
  Classes.forEach(function(Class) {
    var input = new Class();
    assert.deepEqual(msgpack.decode(msgpack.encode(input)), {value: input.value});
  });
});

it("registers an extension whose constructor is named toString", function() {
  var Class = function toString() { this.value = 3; };
  var codec = msgpack.createCodec();
  codec.addExtPacker(0x40, Class, function(value) { return [value.value]; });
  codec.addExtUnpacker(0x40, function(bytes) { return bytes[0]; });
  assert.equal(msgpack.decode(msgpack.encode(new Class(), {codec: codec}), {codec: codec}), 3);
});
