var io = {
  connect: createMockSocketObject
};

function createMockSocketObject () {

  var socket = {
    on: function (ev, fn) {
      this._listeners[ev] = fn;
    },
    emit: function (ev, data) {
      return (this._listeners[ev] || angular.noop)(data);
    },
    _listeners: {},
    removeListener: function (ev) {
      delete this._listeners[ev];
    }
  };

  return socket;
}
