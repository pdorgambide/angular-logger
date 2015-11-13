
# Angular Logger

```javascript
logEnhancerProvider.prefixPattern = '%s::[%s]>';
logEnhancerProvider.datetimePattern = 'dddd h:mm:ss a';
logEnhancerProvider.logLevels = {
	'*': logEnhancerProvider.LEVEL.OFF,
	'main': logEnhancerProvider.LEVEL.WARN,
	'main.subB': logEnhancerProvider.LEVEL.TRACE
};

$log.getInstance('banana').info('Hello World!'); // ignored, logging turned off for '*'
$log.getInstance('main.subA').info('Hello World!'); // ignored, doesn't pass logging threshold of 'main'
$log.getInstance('main.subB').trace('Hello World!'); // 17-5-2015 11:52:52::[main.subB]> Hello World!
$log.getInstance('main.subB').info('Hello %s!', 'World', { 'extra': ['pass-through params'] }); 
// 17-5-2015 11:53:51::[main.subB]> Hello World! Object { "extra": "pass-through params"}
```

---

* Enhances Angular's `$log` service so that you can define **separate contexts** to log for, where the output will be prepended with the context's name and a datetime stamp.
* Further enhances the logging functions so that you can **apply patterns** eliminatinging the need of manually concatenating your strings
* Introduces **log levels**, where you can manage logging output per context or even a group of contexts
* Works as a **complete drop-in** replacement for your current `$log.log` or `console.log` statements
* [original post](http://blog.projectnibble.org/2013/12/23/enhance-logging-in-angularjs-the-simple-way/)

---

- [Installing](#installing)
		- [Bower](#bower)
		- [Manually](#manually)
- [Getting Started](#getting-started)
- [Applying Patterns](#applying-patterns)
		- [Prefix pattern](#prefix-pattern)
		- [Datetime stamp patterns](#datetime-stamp-patterns)
		- [Logging patterns](#logging-patterns)
- [Managing logging priority](#managing-logging-priority)

---

<a name='installing'/>
## Installing

angular-logger has optional dependencies on _[momentjs](https://github.com/moment/moment)_ and _[sprintf.js](https://github.com/alexei/sprintf.js)_: without moment you can't pattern a nicely readable datetime stamp and without sprintf you can't pattern your logging input lines. Default fixed patterns are applied if either they are missing.

<a name='bower'/>
#### Bower

Will be implemented under [issue #10](https://github.com/pdorgambide/angular-logger/issues/10)

<a name='manually'/>
#### Manually

Include _logger.js_, _[momentjs](https://github.com/moment/moment)_ and _[sprintf.js](https://github.com/alexei/sprintf.js)_ in your web app.

<a name='getting-started'/>
## Getting Started

1. After installing, add `logger` module as a dependency to your module:

   ```javascript
   angular.module('YourModule', ['logger'])
   ```
2. Start logging for your context

   ```javascript
   app.controller('LogTestCtrl', function ($log) {
      var normalLogger = $log.getInstance('Normal');
      var mutedLogger = $log.getInstance('Muted');
   
      $log.logLevels['Muted'] = $log.LEVEL.OFF;
   
      this.doTest = function () {
         normalLogger.info("This *will* appear in your console");
         mutedLogger.info("This will *not* appear in your console");
      }
   });
   ```
   [working demo](http://jsfiddle.net/plantface/d7qkaumr/)

<a name='applying-patterns'/>
## Applying Patterns
<a name='prefix-pattern'/>
#### Prefix pattern

By default, the prefix is formatted like so:

`datetime here::[context's name here]>your logging input here`

However, you can change this as follows:

```javascript
app.config(function (logEnhancerProvider) {
   logEnhancerProvider.prefixPattern = '%s - %s: ';
});
app.run(function($log) {
   $log.getInstance('app').info('Hello World');
});
// was:    Sunday 12:55:07 am::[app]>Hello World
// became: Sunday 12:55:07 am - app: Hello World
```

You can also remove it completely, or have just the datetime stamp or just the context prefixed:

```javascript
// by the power of sprintf!
logEnhancerProvider.prefixPattern = '%s - %s: '; // both
logEnhancerProvider.prefixPattern = '%s: '; // timestamp
logEnhancerProvider.prefixPattern = '%1$s: '; // timestamp by index
logEnhancerProvider.prefixPattern = '%2$s: '; // context by index
logEnhancerProvider.prefixPattern = '%2$s - %1$s: '; // both, reversed
```

This works, because angular-logger will use two arguments for the prefix, which can be referenced by index.

<a name='datetime-stamp-patterns'/>
#### Datetime stamp patterns

If you have included _moment.js_ in your webapp, you can start using datetime stamp patterns with angular-logger. The default pattern is `dddd h:mm:ss a`, which translates to _Sunday 12:55:07 am_. You customize the pattern as follows:

```javascript
app.config(function (logEnhancerProvider) {
   logEnhancerProvider.datetimePattern = 'dddd';
});
app.run(function($log) {
   $log.getInstance('app').info('Hello World');
});
// was:    Sunday 12:55:07 am::[app]>Hello World
// became: Sunday::[app]>Hello World
```

This way you can switch to a 24h format this way as well, for example, or use your locale-specific format.

 * For all options, see [moment.js](http://momentjs.com/docs/#/displaying/)

<a name='logging-patterns'/>
#### Logging patterns

If you have included _sprintf.js_ in your webapp, you can start using patterns with _angular-logger_.

Traditional style with `$log` or `console`:
```javascript
$log.error ("Error uploading document [" + filename + "], Error: '" + err.message + "'. Try again later.")
// Error uploading document [contract.pdf], Error: 'Service currently down'. Try again later. "{ ... }"
```

Modern style with angular-logger enhanced `$log`:
 ```javascript
var logger = $log.getInstance("myapp.file-upload");
logger.error("Error uploading document [%s], Error: '%s'. Try again later.", filename, err.message)
// Sunday 12:13:06 pm::[myapp.file-upload]> Error uploading document [contract.pdf], Error: 'Service currently down'. Try again later.
 ```

---

You can even **combine pattern input and normal input**:
 ```javascript
var logger = $log.getInstance('test');
logger.warn("This %s pattern %j", "is", "{ 'in': 'put' }", "but this is not!", ['this', 'is', ['handled'], 'by the browser'], { 'including': 'syntax highlighting', 'and': 'console interaction' });
// 17-5-2015 00:16:08::[test]>  This is pattern "{ 'in': 'put' }" but this is not! ["this", "is handled", "by the browser"] Object {including: "syntax highlighting", and: "console interaction"}
 ```
 
To **log an `Object`**, you now have three ways of doing it, but the combined solution shown above has best integration with the browser.
 ```javascript
logger.warn("Do it yourself: " + JSON.stringify(obj)); // json string with stringify's limitations
logger.warn("Let sprintf handle it: %j", obj); // json string with sprintf's limitations
logger.warn("Let the browser handle it: ", obj); // interactive tree in the browser with syntax highlighting
logger.warn("Or combine all!: %s, %j", JSON.stringify(obj), obj, obj);
 ```

 * For all options, see [sprintf.js](https://github.com/alexei/sprintf.js)

[working demo](https://jsfiddle.net/plantface/qkobLe0m/)

<a name='managing-logging-priority'/>
## Managing logging priority

Using logging levels, we can manage output on several levels. Contexts can be named using dot '.' notation, where the names before dots are intepreted as groups or packages.

For example for `'a.b'` and `a.c` we can define a general log level for `a` and have a different log level for only 'a.c'.

The following logging functions (left side) are available:

logging function  | mapped to: | with logLevel
----------------- | --------------- | --------------
_`logger.trace`_  | _`$log.debug`_       | `TRACE`
_`logger.debug`_  | _`$log.debug`_       | `DEBUG`
_`logger.log*`_   | _`$log.log`_        | `INFO`
_`logger.info`_   | _`$log.info`_        | `INFO`
_`logger.warn`_   | _`$log.warn`_        | `WARN`
_`logger.error`_  | _`$log.error`_       | `ERROR`
`*` maintained for backwards compatibility with `$log.log`

The level's order are as follows:
```
  1. TRACE: displays all levels, is the finest output and only recommended during debugging
  2. DEBUG: display all but the finest logs, only recommended during develop stages
  3. INFO :  Show info, warn and error messages
  4. WARN :  Show warn and error messages
  5. ERROR: Show only error messages.
  6. OFF  : Disable all logging, recommended for silencing noisy logging during debugging. *will* surpress errors logging.
```
Example:

```javascript
// config log levels before the application wakes up
app.config(function (logEnhancerProvider) {
    logEnhancerProvider.prefixPattern = '%s::[%s]> ';
    logEnhancerProvider.logLevels = {
        'a.b.c': logEnhancerProvider.LEVEL.TRACE, // trace + debug + info + warn + error
        'a.b.d': logEnhancerProvider.LEVEL.ERROR, // error
        'a.b': logEnhancerProvider.LEVEL.DEBUG, // debug + info + warn + error
        'a': logEnhancerProvider.LEVEL.WARN, // warn + error
        '*': logEnhancerProvider.LEVEL.INFO // info + warn + error
    };
    // globally only INFO and more important are logged
    // for group 'a' default is WARN and ERROR
    // a.b.c and a.b.d override logging everything-with-TRACE and least-with-ERROR respectively
});


// modify log levels after the application started running
run(function ($log) {
    $log.logLevels['a.b.c'] = $log.LEVEL.ERROR;
    $log.logLevels['*'] = $log.LEVEL.OFF;
});
```

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE

[travis-url]: http://travis-ci.org/pdorgambide/angular-logger
[travis-image]: https://img.shields.io/travis/pdorgambide/angular-logger.svg?style=flat

[coveralls-url]: https://coveralls.io/r/pdorgambide/angular-logger?branch=master
[coveralls-image]: https://coveralls.io/repos/pdorgambide/angular-logger/badge.svg?branch=master

[codeclimate-url]: https://codeclimate.com/github/pdorgambide/angular-logger
[codeclimate-gpa-image]: https://codeclimate.com/github/pdorgambide/angular-logger/badges/gpa.svg

[codacy-url]: https://www.codacy.com/app/b-bottema/angular-logger
[codacy-image]: https://www.codacy.com/project/badge/571878304e9b499f8992c908599fcc35
[codacy-shields-image]: https://img.shields.io/codacy/571878304e9b499f8992c908599fcc35.svg?style=flat
