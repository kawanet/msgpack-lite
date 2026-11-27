var {describe, it} = require("node:test");
var assert = require("node:assert").strict;
var fs = require("fs");
var os = require("os");
var path = require("path");
var spawnSync = require("child_process").spawnSync;
var msgpack = require("../index");

describe("CLI standard stream arguments", function() {
  it("reads stdin when '-' precedes an output filename", function() {
    var directory = fs.mkdtempSync(path.join(os.tmpdir(), "msgpack-cli-stdio-"));
    var output = path.join(directory, "output.msp");
    try {
      var result = run(["-Jm", "-", output], '{"hello":"world"}');
      assert.equal(result.stdout.length, 0);
      assert.deepEqual(msgpack.decode(fs.readFileSync(output)), {hello: "world"});
    } finally {
      if (fs.existsSync(output)) fs.unlinkSync(output);
      fs.rmdirSync(directory);
    }
  });

  it("accepts both standard stream placeholders", function() {
    var result = run(["-Jj", "-", "-"], '{"hello":"world"}');
    assert.equal(result.stdout.toString(), '{"hello":"world"}\n');
  });
});

function run(args, input) {
  var result = spawnSync(process.execPath, [path.join(__dirname, "../bin/msgpack")].concat(args), {
    input: input,
    timeout: 10000
  });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, result.stderr.toString());
  return result;
}
