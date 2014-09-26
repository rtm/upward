var EventListenerPrototype = {
  handleEvent(evt) { this[evt.type](evt); }
};


EventTarget.prototype.on = function(handlers) {
  var listener = Object.create(EventListenerPrototype);
  Object.assign(listener, handlers, {target: this});

  Object.keys(handlers).forEach(function(evt_name) {
    this.addEventListener(evt_name, listener);
  }, this);

  return this;
};
