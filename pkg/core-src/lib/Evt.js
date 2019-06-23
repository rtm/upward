// Event handling
// ==============

// Events are handled by calling `does` on an element, and passing a hash of handlers.

var {create, keys, assign, defineProperty} = Object;
var {prototype} = HTMLElement;

// Prototype for event listeners, defining `handleEvent`,
// which dispatches events to a method of the same name.
var EventListenerPrototype = {
  handleEvent(evt) { return this[evt.type](evt); }
};

// Place property on `Element` prototype.
// Usage:
// ```
// E('button') . does({click: handleButtonClick})
//
// function handleButtonClick(evt) {
//     // this.context is the button
// }
// ```
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
