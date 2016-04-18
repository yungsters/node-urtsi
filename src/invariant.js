'use strict';

function invariant(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

module.exports = invariant;
