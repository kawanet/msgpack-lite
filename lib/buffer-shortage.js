// buffer-shortage.js

exports.BufferShortageError = BufferShortageError;

BufferShortageError.prototype = Error.prototype;

function BufferShortageError() {
}
