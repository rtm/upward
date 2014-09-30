// Event handling
// ==============

// Events are handled by calling `on` on an element, and passing a hash of handlers.
//
// Example:
// ```
// BUTTON().on({click: handleButtonClick});
//
// function handleButtonClick(evt) {
//     // this.context is the button
// }
// ```

// Convenience.
var {create, keys, assign} = Object;

// Define a prototypical `handleEvent` for event listeners,
// which dispatches events to a method of the same name.
var EventListenerPrototype = {
  handleEvent(evt) { return this[evt.type](evt); }
};

// `on` is a method on `EventTarget`s (meaning HTML elements), 
// which is passed event handlers in the form of a hash keyed by event name.
EventTarget.prototype.on = function(handlers) {
  var listener = create(EventListenerPrototype);
  assign(listener, handlers, {context: this});
  keys(handlers).forEach(evt_type => this.addEventListener(evt_type, listener));
  return this;
};
