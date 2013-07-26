/*
 * angular-socket-io v0.1.2
 * (c) 2013 Brian Ford http://briantford.com
 * License: MIT
 */

'use strict';

angular.module('btford.socket-io', []).
  provider('socket', function () {

    // when forwarding events, prefix the event name
    var prefix = 'socket:',
      path;

    // expose to provider
    this.$get = function ($rootScope, $timeout) {

      var socket = io.connect(path);

      var asyncAngularify = function (callback) {
        return function () {  
          var args = arguments;
          $timeout(function () {
            callback.apply(socket, args);
          }, 0);
        };
      };

      var addListener = function (eventName, callback) {
        socket.on(eventName, asyncAngularify(callback));
      };

      var wrappedSocket = {
        on: addListener,
        addListener: addListener,
	io: socket,

        emit: function (eventName, data, callback) {
          if (callback) {
            socket.emit(eventName, data, asyncAngularify(callback));
          } else {
            socket.emit(eventName, data);
          }
        },

	get: function(url, data, callback) {
	    return socket.get(url, data, callback);
	},

	post: function(url, data, callback) {
	    return socket.post(url, data, callback);
	},

	put: function(url, data, callback) {
	    return socket.put(url, data, callback);
	},

	delete: function(url, data, callback) {
	    return socket.delete(url, data, callback);
	},

        removeListener: function () {
          var args = arguments;
          return socket.removeListener.apply(socket, args);
        },

        // when socket.on('someEvent', fn (data) { ... }),
        // call scope.$broadcast('someEvent', data)
        forward: function (events, scope) {
          if (events instanceof Array === false) {
            events = [events];
          }
          if (!scope) {
            scope = $rootScope;
          }
          events.forEach(function (eventName) {
            var prefixed = prefix + eventName;
            var forwardEvent = asyncAngularify(function (data) {
              scope.$broadcast(prefixed, data);
            });
            scope.$on('$destroy', function () {
              socket.removeListener(eventName, forwardEvent);
            });
            socket.on(eventName, forwardEvent);
          });
        }
      };

      return wrappedSocket;
    };

    this.prefix = function (newPrefix) {
      prefix = newPrefix;
    };

    this.path = function (newPath) {
      path = newPath;
    };
  });
