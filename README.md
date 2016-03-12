# TimrJS
Timr is a simple utility for creating timers in JavaScript.

Timr makes use of some ES6 features, so if your project needs to support environments that don't have ES6 support, it's recommended to use a transpiler like babel.

Otherwise it works the latest versions of Node and with browsers using a module bundler like browserify or webpack.

Note: The compiled versions are ES5 friendly, so no need to transpile.
### Installation
```
npm install timrjs --save
```
Alternatively you can download the compiled versions:
```
https://github.com/joesmith100/timrjs/blob/master/dist/timr.js
https://github.com/joesmith100/timrjs/blob/master/dist/timr.min.js
```
Or include the following CDN:
```
https://cdn.rawgit.com/joesmith100/timrjs/master/dist/timr.js
https://cdn.rawgit.com/joesmith100/timrjs/master/dist/timr.min.js
```
Both of these will expose a single global variable: `Timr`.
### Syntax
> Timr([startTime[, options]]);

#### Parameters
**startTime**

The time at which to start the timer. Accepts time as a string, e.g. '10:00' or the time in seconds, e.g. 600.

If the time is omitted - or set to 0 - the timer will act as a stopwatch and count up rather than down.

Note: The stopwatch feature isn't fully tested yet so is considered unstable.

**options**

An optional options object which accepts:
 - _outputFormat_, specify the output of the currentTime string (defaults to MM:SS):
   - _HH:MM:SS_ - 01:00:00 - 00:43:23 - 00:00:25.
   - _MM:SS_ - 01:00:00 - 43:23 - 00:25.
   - _SS_ - 01:00:00 - 43:23 - 25.

### Usage
```js
import Timr from 'timrjs';

const timer = Timr('10:00');

/**
 * The ticker function is the main way to interact with the timer.
 *
 * Every second this will be called and will be provided with the
 * following arguments:
 *  - currentTime (The time in time format).
 *  - currentSeconds (The time in seconds).
 *  - startTime (The initial starting time in seconds).
 *
 * Note: The first time ticker is called will be 1 second after the
 * timer starts. So if you have a 10 minute timer, the first call will
 * be 9:59.
 */

timer.ticker((currentTime, currentSeconds, startTime) => {
  console.log(currentTime)
  // '09:59'
  console.log(currentSeconds)
  // 599
  console.log(startTime)
  // 600
});

/**
 * The finish method is called only once when the timer finishes.
 * No arguments are provided into the function.
 */

timer.finish(() => {
  console.log('timer finished');
  // timer finished
});
```
Because Timr inherits from EventEmitter, you can declare as many unique ticker/finish methods as you want.
```js
/**
 * To start the timer, simply call .start() on the newly
 * created Timr object.
 */

timer.start();

/**
 * pause() and stop() are also available.
 */

timer.pause();
timer.stop();

/**
 * You can get the value of the currentTime at any point by
 * simply calling .getCurrentTime() on the Timr object.
 * This will return the time in seconds.
 *
 * If you want the time to be formatted, you can call .formatTime().
 */

timer.getCurrentTime();
// 600
timer.formatTime();
// '10:00'

/**
 * Timr also keeps track of whether the timer is running or not.
 * You can check this by calling .isRunning().
 * It will return true if the timer is running and false if not.
 */

timer.isRunning();
// false

/**
 * Finally, methods (except formatTime, isRunning and
 * getCurrentTime) return this, so you can chain some
 * methods together.
 */

timer.start().isRunning();
// true
```
That's all there is to it! As simple as you get.
### Bugs
This is my first contribution to the Open Source community and really my first proper project so I fully expect there to be bugs.

If you find any and fancy helping me out, go [here](https://github.com/joesmith100/timrjs/issues) to create an issue, or send one of those fancy pull requests.
### Future Plans
I have some ideas to improve Timr.
 - Option to customise time format separator, e.g. HH-MM-SS.
 - To provide an optional 100 millisecond counter: 01:40:20:24.
 - Refactor, I suspect some of my code is quite verbose.

### License
MIT
