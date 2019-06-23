// LOGGING
// =======
//
// Create parameter lists for `console.log` etc.
//
// Exposing another top-level logging API, which in turn would call
// `console.log`, would result in file/line information in the console
// referring to where our routine made the `console.log` call, rather than
// where the actual logging call was made.
//
// Therefore, we adopt a low-impact solution
// defining a routine to simply format logging parameters and return an array
// suitable for passing to **any** logging routine using the spread operator.
//
// Usage:
// ```
// import logChannel from 'connect/utils/log-channel';
// var channel = logChannel('mychan', { style: { color: red } });
// console.log(...channel(msg));
// ```
//
// A `transports` option may be specified giving a list of transports which are to
// called when invoked via `channel.warn` etc.
// Such transports might send the log message to a server, or write it to localStorage.
// Transports are called with a `{ channel, severity, params }` hash.
// A stack trace is also passed for severities of error and fatal.
// Currently we have `localStorageTransport`, `remoteTransport`,
// `domEventTransport`, and `websocketTransport`.

import {dasherize} from './Str';

// Severities supported by transports, when logger is invoked as `channel.error(...)` etc.
const SEVERITIES = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];

function consoleSupport() {
  var browser = {};
  browser.isFirefox = /firefox/i.test(navigator.userAgent);
  browser.isIE = document.documentMode;

  var support = {};
  support.consoleApply = !browser.isIE || document.documentMode && document.documentMode > 9;
  support.functionGetters = support.consoleApply;
  support.console = !!window.console;
  support.modifiedConsole = !browser.isIE && support.console && console.log.toString().indexOf('apply') !== -1;
  support.styles = !!window.chrome || !!(browser.isFirefox && support.modifiedConsole);
  support.groups = !!(window.console && console.group);

  return support;
}
var support = consoleSupport();

const ALL = /.*/;

var channels          = {};    // Remember groups
var enabledChannels   = ALL;   // Enabled channel regexp, set by `setEnabledChannels`
var enabledSeverities = ALL;   // Enabled severities, set by `setEnabledSeverities`

// CREATE A NEW LOG CHANNEL
// ------------------------
//
// A channel has a name, `style` formatting options for `console.out`, a list of transports,
// and a list of suppressed error levels.
// It is a function which returns an array of parameters suitable for spreading into `console.log`.
// Channels also have properties `info`, `warn` etc., functions which in addition to returning the
// array of parameters, invoke the channel's designated transports.
export default function logChannel(channel, options = {})  {
  var style      = options.style || {};
  var enabled    = options.enabled;
  var transports = options.transports || [];
  var suppress   = options.suppress || [];

  enabled = enabled === undefined ? true : enabled;

  // TODO: replace above with the below, when jshint gets smarter.
  // var { style = {}, enabled = true, transports = [], suppress = [] ) = options;

  // Create string of form `color:red` for use with console's `%c` format specifier.
  var styleString = Object.keys(style) . map(key => dasherize(key) + ':' + style[key]).join(';');

  var fn = function(maybeFormat, ...params) {
    var format = support.styles ? `%c[${channel}]` : `[${channel}]`;

    if (!enabled || !enabledChannels.test(channel)) return [];

    // If the first parameter is a string, it may contain formatting codes such as `%s`.
    // In that case, append it to our formatting string so things work as expected.
    if (typeof maybeFormat === 'string') {
      format += ' ' + maybeFormat;
      return support.styles ? [format, styleString, ...params] : [format, ...params];
    } else {
      return support.styles ? [format, styleString, maybeFormat, ...params] : [format, maybeFormat, ...params];
    }
  };

  // Add severity-specific interfaces invoked via `channel.warn` etc.
  // These also send the log information to the specified transports.
  SEVERITIES.forEach(
    severity =>
      fn[severity] = function(...params) {
        if (!enabled || suppress.indexOf(severity) !== -1 || !enabledSeverities.test(severity)) return [];

        if (severity === 'error' || severity === 'fatal') {
          var stack = new Error().stack;
          transports.forEach(transport => transport({ channel, severity, params, stack }));
        } else {
          transports.forEach(transport => transport({ channel, severity, params }));
        }

        // Return the array of parameters in case this is to be spread into `console.log`.
        return fn(name, ...params);
      }
  );

  // Add interfaces for enabling and disabling this channel.
  // ```
  // var channel = logChannel('speech');
  // channel.disable();
  // ```
  fn.enable  = () => enabled = true;
  fn.disable = () => enabled = false;

  return channels[channel] = fn;
}

// Enable channels at global level.
export function enableChannel (channel)  { if (channels[channel]) channels[channel].enable();  }
export function disableChannel(channel)  { if (channels[channel]) channels[channel].disable(); }

export function enableChannels(regexp)   { enabledChannels   = new RegExp(regexp); }
export function enableAllChannels()      { enabledChannels   = ALL;            }

export function enableSeverities(regexp) { enabledSeverities = new RegExp(regexp); }
export function enableAllSeverities()    { enabledSeverities = ALL;            }


// LOCAL STORAGE-BASED TRANSPORT
// -----------------------------
//
// The value in local storage under the specified key is JSONified array of log entries.
// The transport exposes `get` and `clear` APIs to get array of log entries etc.
// UNTESTED.
export function localStorageTransport(key) {

  // Get the array of log entries from local storage.
  function get() { return JSON.parse(localStorage.getItem(key) || '[]'); }

  // Clear the local storage key.
  function clear() { localStorage.clear(key); }

 // Put the array of log entries into local storage.
  function put(logs) { localStorage.setItem(key, JSON.stringify(logs)); }

  // Transport retrieves current set of log entries and adds new one.
  function transport(log) { put(get() . concat(log)); }

  // Add utility functions to return array of log and clear.
  Object.defineProperties(transport, { get: { value: get }, clear: { value: clear } });

  return transport;
}


// TRANSPORT FOR POSTING LOG DATA TO REMOTE URL
// --------------------------------------------
// UNTESTED. Needs fetch.
export function remoteTransport(url) {

  return function(log) {
    // TODO: bring in fetch from somewhere
    var fetch;
    var headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
    var method  = 'POST';
    var body    =  JSON.stringify(log);

   fetch(url, { method, headers, body });
    // How to report error?
  };

}


// WEBSOCKET-BASED TRANSPORT
// -------------------------
export function websocketTransport(socket) {
  return function(log) { socket.send(JSON.stringify(log)); };
}


// DOM EVENT-BASED TRANSPORT
// -------------------------
//
// Use the DOM event mechanism to report log entries.
// The target element is specified, or defaults to `document`.
// The listener consults the `detail` property of the event object to find the log info.
//
// Usage:
// ```
// import logChannel, {domEventTransport} from 'connect/utils/log-channel';
// var transport = domEventTransport('myevent');
// var channel   = logChannel('mychan', { transports: [transport] });
// channel.warn("Warning");
//
// document.addEventListener("myevent", function({ detail: { channel })  { alert("Got warning!"); });
// ```
export function domEventTransport(eventName, elt = document) {

  function transport(detail) {
    var event = new CustomEvent(eventName, { detail });
    elt.dispatchEvent(event);
  }

  return transport;
}


// POSTMESSAGE-BASED TRANSPORT
// ---------------------------

// Use postMessage to post the log info to another window.
export function postMessageTransport(otherWindow, targetOrigin = '*') {
  return function transport(log) {
    otherWindow.postMessage(log, targetOrigin);
  };
}
