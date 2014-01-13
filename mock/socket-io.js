var io = {
  connect: createMockSocketObject
};

function createMockSocketObject () {

  var socket = {
    on: function (ev, fn) {
      if (!this._listeners) {
        this._listeners = {};
      }

      if (!this._listeners[ev]) {
        this._listeners[ev] = fn;
      } else if (io.util.isArray(this._listeners[ev])) {
        this._listeners[ev].push(fn);
      } else {
        this._listeners[ev] = [this._listeners[ev], fn];
      }
    },
    emit: function (ev, data) {
      return (this._listeners[ev] || angular.noop)(data);
    },
    removeListener: function (ev, fn) {
      if (this._listeners && this._listeners[ev]) {
        var list = this._listeners[ev];

        if (io.util.isArray(list)) {
          var pos = -1;

          for (var i = 0, l = list.length; i < l; i++) {
            if (list[i] === fn || (list[i].listener && list[i].listener === fn)) {
              pos = i;
              break;
            }
          }

          if (pos < 0) {
            return this;
          }

          list.splice(pos, 1);

          if (!list.length) {
            delete this._listeners[ev];
          }
        } else if (list === fn || (list.listener && list.listener === fn)) {
          delete this._listeners[ev];
        }
      }
    },
    removeAllListeners: function (ev) {
      this._listeners[ev] = null;
    }
  };

  return socket;
}
