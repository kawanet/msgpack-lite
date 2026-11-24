var {describe, it} = require("node:test");
var assert = require("node:assert").strict;
var vm = require("node:vm");

[
  ["source", require("../index")],
  ["bundle", require("../dist/msgpack.min")]
].forEach(function(variant) {
  var api = variant[1];
  describe("preset codec across realms (" + variant[0] + ")", function() {
    it("preserves the name fallback for cross-realm preset values", function() {
      var options = {codec: api.createCodec({preset: true})};
      var foreignDate = vm.runInNewContext("new Date(12345)");
      var foreignArray = vm.runInNewContext("new Uint16Array([1, 65535])");

      var date = api.decode(api.encode(foreignDate, options), options);
      assert.ok(date instanceof Date);
      assert.equal(Number(date), 12345);
      var array = api.decode(api.encode(foreignArray, options), options);
      assert.ok(array instanceof Uint16Array);
      assert.deepEqual(Array.prototype.slice.call(array), [1, 65535]);
    });
  });
});
