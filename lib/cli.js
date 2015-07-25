// cli.js

var fs = require("fs");
var msgpack = require("../");

exports.CLI = CLI;

function help() {
  var cfgmap = {
    "M": "input MessagePack",
    "J": "input JSON",
    "m": "output MessagePack",
    "j": "output JSON",
    "h": "show help message",
    "1": "add spacer for JSON"
  };
  process.stderr.write("Usage: msgpack-lite -[flags] [infile] [outfile]\n");
  Object.keys(cfgmap).forEach(function(key) {
    process.stderr.write("  -" + key + "  " + cfgmap[key] + "\n");
  });
  process.exit(1);

}

function CLI() {
  var input = "-";
  var output = "-";
  var args = {};
  Array.prototype.forEach.call(arguments, function(val) {
    if (val[0] === "-") {
      val.split("").forEach(function(c) {
        args[c] = true;
      });
    } else if (!input) {
      input = val;
    } else {
      output = val;
    }
  });

  if (args.h) return help();
  if (!Object.keys(args).length) return help();


  input = (input === "-") ? process.stdin : fs.createReadStream(input);
  output = (output === "-") ? process.stdout : fs.createWriteStream(output);

  var buf = [];
  input.on("data", function(data) {
    buf.push(data);
  });
  input.on("end", function() {
    buf = Buffer.concat(buf);
    if (args.J) {
      buf = JSON.parse(buf);
    } else {
      buf = msgpack.decode(buf);
    }
    if (args.j) {
      var spacer = args[1] ? " " : "";
      buf = JSON.stringify(buf, null, spacer);
      output.write(buf);
    } else {
      msgpack.encode(buf, output);
    }
  });
}
