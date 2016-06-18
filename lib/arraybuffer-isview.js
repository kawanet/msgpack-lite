// arraybuffer-isview.js

module.exports = ArrayBuffer.isView || isView;

var toString = {}.toString;

/**
 * @param typedarray {Uint8Array}
 * @returns {boolean}
 */

function isView(typedarray) {
  return typedarray && toString.call(typedarray.buffer) === "[object ArrayBuffer]";
}
