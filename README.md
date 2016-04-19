# TimrJS

Timr is a simple, event driven utility for creating timers in JavaScript.

Compatible with Browsers and NodeJS.

Additionally, the compiled versions support RequireJS.

### Installation
Install with npm or Bower.
```
npm install timrjs --save
```

Alternatively you can include the following:
> https://cdn.rawgit.com/joesmith100/timrjs/master/dist/timr.js
> https://cdn.rawgit.com/joesmith100/timrjs/master/dist/timr.min.js

Or you can include `node_modules/dist/timr.js` on your page with a standalone `<script>` tag.

Both of these will expose a single global method `Timr`. Alternatively, they will define a module if you are using RequireJS `require(['timrjs'])`.

### Syntax
```
Timr(startTime[, options]]);
```

#### Parameters
**startTime**

Accepts a string or a number; a number is treated as seconds. Examples of accepted syntax:
 - `'10:00'` - Time units must be separated by a colon.
 - `600` - Equivalent to 10:00.
 - `'50'` - 50 seconds.
 - `'25m'` - Equivalent to '25:00'
 - `'25h'` - Equivalent to '25:00:00'
 - `0` - Sets up a stopwatch style counter, counting up rather than down.

If the provided time is invalid an error will be thrown. Times up to 999:59:59 are supported.

**options**

Optional. Object which accepts:
 - `outputFormat` - Specify the display of time string. Defaults to `'MM:SS'`
   - Accepts the following values (case insensitive):
     - `'HH:MM:SS'` e.g. output: `'01:00:00'` `'00:43:23'` `'00:00:25'`.
     - `'MM:SS'` e.g. output: `'01:00:00'` - `'43:23'` - `'00:25'`.
     - `'SS'` e.g. output: `'01:00:00'` - `'43:23'` - `'25'`.
 - `formatType` - Specify how the time string is created. Defaults to `'h'`
    - Accepts the following values (case insensitive):
      - `'h'` e.g. output: `'02:00:00'`
      - `'m'` e.g. output: `'120:00'`
      - `'s'` e.g. output: `'7200'`
 - `separator` - Specify how the formatted time is separated. Defaults to `':'`
   - Accepts any string value, so you could use `'foobar'` if you really want to.
 - `store` - Overrides the global store setting if provided.
   - Accepts `true` or `false`.

### Usage
Import Timr into your project.
```js
import Timr from 'timrjs';
```
To create a Timr, simply call the function with the desired start time.
```js
const timer = Timr('10:00');
```

To `start`, `pause` and `stop` the timer, call the method on the Timr.
```js
timer.start();
timer.pause();
timer.stop();
```
Each Timr emits 2 primary events, `ticker` and `finish`.

The `ticker` function is called every second the timer ticks down and is provided with the following arguments:
 - `formattedTime` - The current time formatted into a time string. Customisable with outputFormat and separator options.
 - `percentDone` - The elapsed time in percent.
 - `currentTime` - The current time in seconds.
 - `startTime` - The starting time in seconds.
 - `self` - The original Timr object.

_Note: The first time ticker is called will be 1 second after the timer starts. So if you have a 10:00 timer, the first call will be 09:59._
```js
timer.ticker((formattedTime, percentDone, currentTime, startTime, self) => {
  console.log(formattedTime);
  // '09:59'
  console.log(percentDone);
  // 0
  console.log(currentTime);
  // 599
  console.log(startTime);
  // 600
  console.log(self);
  // Timr {_events: Object, _maxListeners: undefined, timer: 319, running: true, options: Object…}
});
```
_When used as a stopwatch, the ticker will be provided with 3 arguments, `formattedTime`, `currentTime` and `self`._

The `finish` method is called once, when the timer hits 0. Only 1 argument is provided into the function, the original Timr object.
```js
timer.finish(self => {
  console.log(self)
  // Timr {_events: Object, _maxListeners: undefined, timer: 319, running: false, options: Object…}
});
```
_When used as a stopwatch, the timer will stop and the finish function will fire when the time reaches the maximum supported time `'999:59:59'`_

All the above methods return a reference to the Timr, so calls can be chained.
#### Helper Methods
There are a number of helper methods available to Timrs.
 - `destroy` - Clears the timer, removes all event listeners and removes the Timr from the store.
 - `formatTime` - Returns the currentTime, formatted.
 - `formatStartTime` - Returns the startTime, formatted.
 - `percentDone` - Returns the time elapsed in percent.
 - `setStartTime` - Changes startTime to the one provided and returns it formatted. Will stop the timer if its running. It's also subject to validation, so will throw an error if the provided time is invalid.
 - `getStartTime` - Returns the startTime in seconds.
 - `getCurrentTime` - Returns the currentTime in seconds.
 - `isRunning` - Returns true if the timer is running, false otherwise.

```js
timer.destroy();
// Returns a reference to the Timr.
timer.formatTime();
// '10:00'
timer.formatStartTime();
// '10:00'
timer.percentDone();
// 0
timer.setStartTime('11:00');
// '11:00'
timer.getStartTime();
// 600
timer.getCurrentTime();
// 600
timer.isRunning();
// false
```
### Global Timr Features
#### Store
The store is basically an array that stores all Timr objects created, providing some useful methods that can be run on all Timrs at once.

By default this feature is disabled, to enable, set the store variable to true after importing Timr.
```js
import Timr from 'timrjs';

Timr.store = true;
```
Each Timr can override this setting on creation by setting the store option:
```js
const timer = Timr('10:00', {store: false});
// This Timr won't be stored, regardless of the global setting.
```
**Available Methods**
 - `Timr.getAll` - Returns the array of all stored Timrs.
 - `Timr.startAll` - Starts all stored Timrs.
 - `Timr.pauseAll` - Pauses all stored Timrs.
 - `Timr.stopAll` - Stops all stored Timrs.
 - `Timr.isRunning` - Returns a new array of all stored Timrs that are running.
 - `Timr.removeFromStore` - Removes the provided Timr from the store.
 - `Timr.destroyAll` - Destroys all stored Timrs, clearing them and removing them from the store.

#### Global Helper Methods
There are also a number of helper methods available on the Global Timr function. These are all internal functions used for creating Timrs, but could be useful on their own.
 - `Timr.validate` - Validates the startTime and returns it converted to seconds.
   - Checks validity of time string.
   - Ensures provided time is a number or a string.
   - Ensures provided time does not exceed '999:59:59'.
 - `Timr.formatTime` - Converts seconds into a time string.
   - `seconds` - Required. The seconds to be converted.
   - `separator` - See https://github.com/joesmith100/timrjs#parameters
   - `outputFormat` - See https://github.com/joesmith100/timrjs#parameters
 - `Timr.timeToSeconds` - Converts a time string into seconds. Must be separated by a colon, e.g. '10:00'.
 - `Timr.incorrectFormat` - Checks the format of a time string. Must be separated by a colon, e.g. '10:00'. Used in the validate method above.

```js
Timr.validate('10:00');
// 600
Timr.validate(600);
// 600
Timr.validate('invalid input');
// Throws an error
Timr.validate('25:00:00');
// Throws an error

Timr.formatTime(600);
// '10:00'
Timr.formatTime(600, '-');
// '10-00'
Timr.formatTime(600, null, 'HH:MM:SS');
// '00:10:00'

Timr.timeToSeconds('10:00');
// 600
Timr.timeToSeconds('1:34:23');
// 5663

Timr.incorrectFormat('10:00');
// false
Timr.incorrectFormat('25:00:00');
// true
Timr.incorrectFormat('invalid');
// true
```
### Bugs
This is my first contribution to the Open Source community so I fully expect there to be bugs.

If you find any and fancy helping me out, go _**[here](https://github.com/joesmith100/timrjs/issues)**_ to create an issue, or send one of those fancy pull requests.
### License
MIT
