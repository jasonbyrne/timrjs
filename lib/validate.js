'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var timeToSeconds = require('./utils/timeToSeconds');
var correctFormat = require('./utils/correctFormat');

/**
 * @description Validates the provded time
 *
 * Additionally, if a pattern is provided, 25h / 25m, than
 * it is converted here before being passed to timeToSeconds.
 *
 * @param {String|Number} time - The time to be checked
 *
 * @throws If the provided time is neither a number nor a string.
 * @throws If the provided time is a negative number.
 * @throws If the provided time is not in the correct format.
 * @throws If the provided time in seconds is over 999:59:59.
 *
 * @returns {Number} - The original number or the converted number if
 * a time string was provided.
 */

module.exports = function (time) {
  if (/^\d+[mh]$/i.test(time)) {
    time = time.replace(/^(\d+)m$/i, '$1:00');
    time = time.replace(/^(\d+)h$/i, '$1:00:00');
  }

  if (!(!isNaN(time) && time !== Infinity && time !== -Infinity && typeof time === 'number' || typeof time === 'string')) {
    throw new Error('Expected time to be a string or number, instead got: ' + (
    // Passes correct type, including null, NaN and Infinity
    typeof time === 'number' || time === null ? time : typeof time === 'undefined' ? 'undefined' : _typeof(time)));
  }

  if (!(isNaN(Number(time)) || Number(time) >= 0)) {
    throw new Error('Expected a time string or a number, instead got: ' + time);
  }

  if (!correctFormat(time)) {
    throw new Error('Expected a time string or a number, instead got: ' + time);
  }

  if (timeToSeconds(time) > 3599999) {
    throw new Error('Sorry, we don\'t support any time over 999:59:59.');
  }

  return timeToSeconds(time);
};