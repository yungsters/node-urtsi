'use strict';

function stringPad(string, size, padding) {
  if (arguments.length < 3) {
    padding = '0';
  }
  if (string.length >= size) {
    return string;
  }
  return new Array(size - string.length + 1).join(padding) + string;
}

module.exports = stringPad;
