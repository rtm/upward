var {create, keys, assign} = Object;

// Event handling
// ==============

// Events are handled by calling `does` on an element, and passing a hash of handlers.
//
// Example:
// ```
// El('button').does({click: handleButtonClick});
//
// function handleButtonClick(evt) {
//     // this.context is the button
// }
// ```

var {defineProperty} = Object;
var {prototype} = HTMLElement;

// Define a prototypical `handleEvent` for event listeners,
// which dispatches events to a method of the same name.
var EventListenerPrototype = {
  handleEvent(evt) { return this[evt.type](evt); }
};

// @TODO: define stand-along UpHandlers routine and export it.

// `does` is a method on `HTMLElement`
// to which you pass event handlers in the form of a hash keyed by event name.
const DOESPROP = 'does';

if (!prototype[DOESPROP]) {
  defineProperty(prototype, DOESPROP, {
    value(handlers) {
      var listener = create(EventListenerPrototype);
      assign(listener, handlers, {context: this});
      keys(handlers).forEach(evt_type => this.addEventListener(evt_type, listener));
      return this;
    }
  });
}
