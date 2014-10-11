var {create, keys, assign} = Object;

// Event handling
// ==============

// Events are handled by calling `events` on an element, and passing a hash of handlers.
//
// Example:
// ```
// BUTTON().events({click: handleButtonClick});
//
// function handleButtonClick(evt) {
//     // this.context is the button
// }
// ```

// Define a prototypical `handleEvent` for event listeners,
// which dispatches events to a method of the same name.
var EventListenerPrototype = {
  handleEvent(evt) { return this[evt.type](evt); }
};

// `events` is a method on `EventTarget`s (meaning HTML elements), 
// to which you pass event handlers in the form of a hash keyed by event name.
EventTarget.prototype.events = function(handlers) {
  var listener = create(EventListenerPrototype);
  assign(listener, handlers, {context: this});
  keys(handlers).forEach(evt_type => this.addEventListener(evt_type, listener));
  return this;
};
