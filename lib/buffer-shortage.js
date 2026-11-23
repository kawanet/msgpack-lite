// buffer-shortage.js

module.exports = bufferShortage;

function bufferShortage() {
  var error = new Error("BUFFER_SHORTAGE: input buffer is too short to decode a complete MessagePack value");
  error.code = "BUFFER_SHORTAGE";
  return error;
}
