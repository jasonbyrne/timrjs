'use strict';

/**
 * @description Checks the validity of each option passed.
 *
 * @param {String} option - The options name.
 * @param {String} value - The options value.
 *
 * @throws If the option check fails, it throws a speicifc error.
 */

const checkOption = (option, value) => {
  const errors = require('./errors')(value);

  switch(option) {
    case 'outputFormat':
      if (typeof value !== 'string') {
        throw errors('outputFormatType');
      }
      if (
        value !== 'HH:MM:SS' &&
        value !== 'MM:SS' &&
        value !== 'SS'
      ) { throw errors('invalidOutputFormat'); }
    case 'separator':
      if (typeof value !== 'string') {
        throw errors('separatorType');
      }
  }
};

/**
 * @description Builds an options object from default and custom options.
 *
 * @param {Object} options - Custom options.
 * @returns {Object} Compiled options from default and custom.
 */

module.exports = (options) => {
  const defaultOptions = {
    outputFormat: 'MM:SS',
    separator: ':'
  };
  if (options) {
    for (let option in options) {
      checkOption(option, options[option]);
      defaultOptions[option] = options[option];
    }
  }
  return defaultOptions;
};
