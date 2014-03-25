var io = {
  connect: createMockSocketObject
};

function createMockSocketObject () {

  var socket = {
    on: function (ev, fn) {
      (this._listeners[ev] = this._listeners[ev] || []).push(fn);
    },
    emit: function (ev, data) {
      if (this._listeners[ev]) {
        this._listeners[ev].forEach(function (listener) {
          listener(data);
        });
      }
    },
    _listeners: {},
    removeListener: function (ev, fn) {
      if (fn) {
        var index = this._listeners[ev].indexOf(fn);
        if (index > -1) {
          this._listeners[ev].splice(index, 1);
        }
      } else {
        delete this._listeners[ev];
      }
    }
  };

  return socket;
}
