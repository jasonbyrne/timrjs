/**
 * TimrJS v0.3.0
 * https://github.com/joesmith100/timrjs
 * https://www.npmjs.com/package/timrjs
 *
 * Copyright (c) 2016 Joe Smith
 * Released under the MIT license
 * https://github.com/joesmith100/timrjs/blob/master/LICENSE
 *
 * Date: 15-04-2016 11:20
 */

;(function(global){
  'use strict';

  /**
  * @description Object.assign polyfill
  */
  if (typeof Object.assign != 'function') {
   Object.assign = function (target) {
     if (target === undefined || target === null) {
       throw new TypeError('Cannot convert undefined or null to object');
     }
     var output = Object(target);
     for (var index = 1; index < arguments.length; index++) {
       var source = arguments[index];
       if (source !== undefined && source !== null) {
         for (var nextKey in source) {
           if (source.hasOwnProperty(nextKey)) {
             output[nextKey] = source[nextKey];
           }
         }
       }
     }
     return output;
   };
  }

  var
    errors = function(value) {
      return {
        startTime: new TypeError('The starting time needs to be a number (seconds) or a string representation of the time, e.g. 10:00. Instead got: ' + value),
        incorrectFormat: new Error('Provided time is not in the correct format. Expected HH:MM:SS / MM:SS / SS, got: ' + value),
        eventFunctions: new TypeError('Ticker/finish requires a function, instead got: ' + value),
        outputFormat: new Error('Incorrect outputFormat, expected a string: HH:MM:SS, MM:SS or SS. Instead got: ' + value),
        separator: new TypeError('Expected separator to be a string, instead got: ' + value)
      }
    },

    /**
     * @description Checks the validity of each option passed.
     *
     * @param {String} The options name.
     * @param {String} The options value.
     * @throws If the option check fails, it throws a speicifc error.
     */
    checkOption = function(option, value) {
      switch(option) {
        case 'outputFormat':
          if (typeof value !== 'string') {
            throw errors(typeof value).outputFormat;
          }
          if (
            value !== 'HH:MM:SS' &&
            value !== 'MM:SS' &&
            value !== 'SS'
          ) { throw errors(value).outputFormat }
        case 'separator':
          if (typeof value !== 'string') {
            throw errors(typeof value).separator;
          }
      }
    },

    /**
     * @description
     * Builds an options object from default and custom options.
     *
     * @param {Object} Custom options.
     * @returns {Object} Compiled options from default and custom.
     */
    buildOptions = function(options) {
      var defaultOptions = {
        outputFormat: 'MM:SS',
        separator: ':'
      };
      for (var option in options) {
        checkOption(option, options[option]);
      }
      return Object.assign({}, defaultOptions, options);
    },

    /**
     * @description Checks the provided time for correct formatting.
     *
     * @param {String} The provided time string.
     * @returns {Boolean} True if format is incorrect, false otherwise.
     */
    incorrectFormat = function(time) {
      time = time.split(':');
      if (
        time.length === 3 && (
          (+time[0] < 0 || +time[0] > 23 || isNaN(+time[0])) ||
          (+time[1] < 0 || +time[1] > 59 || isNaN(+time[1])) ||
          (+time[2] < 0 || +time[2] > 59 || isNaN(+time[2]))
        )
      ) { return true; }
      if (
        time.length === 2 && (
          (+time[0] < 0 || +time[0] > 59 || isNaN(+time[0])) ||
          (+time[1] < 0 || +time[1] > 59 || isNaN(+time[1]))
        )
      ) { return true; }
      if (
        time.length === 1 && (
          (+time[0] < 0 || +time[1] > 59 || isNaN(+time[0]))
        )
      ) { return true; }

      return false;
    },

    /**
     * @description Converts time format (HH:MM:SS) into seconds.
     *
     * @param {String} The time to be converted.
     * @returns {Number} The converted time in seconds.
     */
    timeToSeconds = function(time) {
      return time.split(':')
        .map(function(item, index, arr) {
          if (arr.length === 1) { return +item; }
          if (arr.length === 2) {
            if (index === 0) { return +item * 60; }
            return +item;
          }
          if (arr.length === 3) {
            if (index === 0) { return +item * 60 * 60; }
            if (index === 1) { return +item * 60; }
            return +item
          }
        })
        .reduce(function(a, b) { return a+b }, 0);
    },

    /**
     * @description
     * Pads out single digit numbers with a 0 at the beginning.
     * Primarly used for time units - 00:00:00.
     *
     * @param {Number} Number to be padded.
     * @returns {String} A 0 padded string or the the original
     * number as a string.
     */
    zeroPad = function(num) {
      return num < 10 ? '0' + num : '' + num;
    },

    /**
     * Class representing a new Timr.
     *
     * @description Creates a Timr.
     * @param {Number} The startTime (in seconds)
     */
    Timr = function(startTime, options) {
      this.timer = null;
      this.events = {};
      this.running = false;
      this.options = options;
      this.startTime = startTime;
      this.currentTime = startTime;
    };

  Timr.prototype = {

    constructor: Timr,

    /**
     * @description Simulates Node EventEmitter on method.
     *
     * @param {String} The name of the event.
     * @param {Function} The function to call when emitted.
     */
    on: function(name, fn) {
      if (!Array.isArray(this.events[name])) { this.events[name] = []; }
      this.events[name].push(fn);
    },

    /**
     * @description Simulates Node EventEmitter emit method.
     *
     * @param {String} The event to fire.
     */
    emit: function(name) {
      if (!this.events[name] || this.events[name].length === 0) {
        return;
      }
      var args = [];
      for (var i = 1, j = arguments.length; i < j; i++) {
        args.push(arguments[i]);
      }
      for (var x = 0, y = this.events[name].length; x < y; x++) {
        this.events[name][x].apply(this, args);
      }
    },

    /**
     * @description Starts the timr.
     * @return {Object} Returns the instance of Timr.
     * For possible method chaining.
     */
    start: function() {
      if (!this.running) {
        this.running = true;
        if (this.startTime > 0) {
          this.timer = setInterval(this.countdown.bind(this), 1000);
        } else {
          this.timer = setInterval(this.stopwatch.bind(this), 1000);
        }
      } else {
        console.warn('Timer already running');
      }
      return this;
    },

    /**
     * @description Pauses the timr.
     * @return {Object} Returns the instance of Timr.
     * For possible method chaining.
     */
    pause: function() {
      this.clear();
      this.running = false;
      return this;
    },

    /**
     * @description Stops the timr.
     * @return {Object} Returns the instance of Timr.
     * For possible method chaining.
     */
    stop: function() {
      this.clear();
      this.running = false;
      this.currentTime = this.startTime;
      return this;
    },

    /**
     * @description Clears the timr.
     * Only used by internal methods.
     * @return {Object} Returns the instance of Timr.
     * For possible method chaining.
     */
    clear: function() {
      clearInterval(this.timer);
      return this;
    },

    /**
     * @description The ticker method is called every second
     * the timer ticks down.
     *
     * As Timr simulates Node EventEmitter, this can be called
     * multiple times with different functions and each one will
     * be called when the event is emitted.
     *
     * @throws If the argument is not of type function.
     *
     * @param {Function} Function to be called every second.
     * @return {Object} Returns the instance of Timr.
     * For possible method chaining.
     */
    ticker: function(fn) {
       if (typeof fn !== 'function') { throw errors(typeof fn).eventFunctions; }
       this.on('ticker', fn);
       return this;
    },

    /**
     * @description The finish method is called once when the
     * timer finishes.
     *
     * As Timr simulates Node EventEmitter, this can be called
     * multiple times with different functions and each one will
     * be called when the event is emitted.
     *
     * @throws If the argument is not of type function.
     *
     * @param {Function} Function to be called when finished.
     * @return {Object} Returns the instance of Timr.
     * For possible method chaining.
     */
    finish: function(fn) {
      if (typeof fn !== 'function') { throw errors(typeof fn).eventFunctions; }
      this.on('finish', fn);
      return this;
    },

    /**
     * @description A stopwatch style counter.
     * Counts upwards, rather than down
     * @return {Object} Returns the instance of Timr.
     * For possible method chaining.
     */
    stopwatch: function() {
      this.currentTime += 1;
      this.emit('ticker', this.formatTime(), this.currentTime);
      return this;
    },

    /**
     * @description The main Timr function for counting down.
     * Bound to a setInterval timer when start() is called.
     *
     * @return {Object} Returns the instance of Timr.
     * For possible method chaining.
     */
    countdown: function() {
     this.currentTime -= 1;
     this.emit('ticker', this.formatTime(), this.currentTime, this.startTime);
     if (this.currentTime <= 0) {
      this.emit('finish');
      this.stop();
     }
     return this;
    },

    /**
     * @description Converts seconds back to time format.
     * This is provided to the ticker method as the first argument.
     *
     * @return {String} Returns the formatted string.
     */
    formatTime: function() {
      var seconds = this.currentTime,
        minutes = seconds / 60;
      if (minutes >= 1) {
        var hours = minutes / 60;
        minutes = Math.floor(minutes);
        if (hours >= 1) {
          hours = Math.floor(hours);
          return zeroPad(hours) + this.options.separator + zeroPad(minutes - hours * 60) + this.options.separator + zeroPad(seconds - minutes * 60);
        }
        return (this.options.outputFormat === 'HH:MM:SS' ? '00' + this.options.separator : '') + zeroPad(minutes) + this.options.separator + zeroPad(seconds - minutes * 60);
      }
      return (this.options.outputFormat === 'HH:MM:SS' ? '00' + this.options.separator + '00' + this.options.separator : this.options.outputFormat === 'MM:SS' ? '00' + this.options.separator : '') + zeroPad(seconds);
    },

    /**
     * @description Gets the Timrs current time.
     * @returns {Number} Current time in seconds
     */
    getCurrentTime: function() {
      return this.currentTime;
    },

    /**
     * @description Gets the Timrs running value.
     * @returns {Boolean} True if running, false if not.
     */
    isRunning: function() {
      return this.running;
    }

  }

  /**
   * @description Creates a new Timr object.
   *
   * @param {String} [startTime=0] The starting time for the timr object.
   * @param {Object} [options] - Options to customise the timer.
   *
   * @throws {TypeError} Will throw an error if the provided
   * argument is not of type string or number.
   *
   * @throws Will throw an error if provided option doesn't
   * meet criteria.
   *
   * @throws Will throw an error if the provided startTime is
   * incorrect format.
   *
   * @returns {Object} A new Timr object.
   */
  function init(startTime, options) {
    startTime = startTime || 0;
    if (typeof startTime === 'string') {
      if (incorrectFormat(startTime)) {
        throw errors(startTime).incorrectFormat;
      }
      return new Timr(timeToSeconds(startTime), buildOptions(options));
    }
    if (typeof startTime !== 'number') {
      throw errors(typeof startTime).startTime;
    }
    return new Timr(startTime, buildOptions(options));
  };

  /**
   * Exposes Timr to global scope.
   */
  global.Timr = init;

// TODO: Provide global if window is undefined.
}(window));
