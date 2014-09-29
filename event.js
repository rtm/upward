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

// Define a prototypical `handleEvent` on `EventListener`s.
// This dispatches events to a method of the same name.
// Event-handling methods can examine `this.context` to get the underlying `this`.
var EventListenerPrototype = {
  handleEvent(evt) { this[evt.type](evt); }
};


// `on` is placed on `EventTargets` (meaning HTML elements), 
// taking a hash of handlers keyed by event name.
EventTarget.prototype.on = function(handlers) {
  var listener = Object.create(EventListenerPrototype);
  Object.assign(listener, handlers, {context: this});

  Object.keys(handlers).forEach(function(evt_name) {
    this.addEventListener(evt_name, listener);
  }, this);

  return this;
};
