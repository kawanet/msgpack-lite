module.exports = Array.isArray || function (array) {
  return "[object Array]" === Object.prototype.toString.call(array);
};
