'use strict';

const incorrectFormat = require('./incorrectFormat');

/**
 * @description Converts time format (HH:MM:SS) into seconds.
 *
 * @param {String} time - The time to be converted.
 *
 * @throws Will throw an error if the provided time is
 * incorrect format.
 *
 * @returns {Number} The converted time in seconds.
 */

module.exports = (time) => {
  if (incorrectFormat(time)) {
    throw new Error(
      `Warning! Provided time is not in the correct format. Expected time format (HH:MM:SS, MM:SS or SS), instead got: ${time}`
    );
  }

  return time.split(':')
    .reduce((prevItem, currentItem, index, arr) => {
      let hours   = prevItem + +currentItem * 60 * 60
        , minutes = prevItem + +currentItem * 60
        , seconds = prevItem + +currentItem;

      if (arr.length === 3) {
        if (index === 0) { return hours; }
        if (index === 1) { return minutes; }
      }

      if (arr.length === 2) {
        if (index === 0) { return minutes; }
      }

      return seconds;
    }, 0)
}
