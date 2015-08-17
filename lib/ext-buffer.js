// ext-buffer.js

exports.ExtBuffer = ExtBuffer;

function ExtBuffer(buffer) {
  if (!(this instanceof ExtBuffer)) return new ExtBuffer(buffer);
  this.buffer = buffer;
}

ExtBuffer.prototype.type = 0;