/*
 * @license
 * angular-socket-io v0.7.0
 * (c) 2014 Brian Ford http://briantford.com
 * License: MIT
 */

angular.module('btford.socket-io').

  factory('deferredSocketFactory', function () {

    'use strict';

      return function deferredSocketFactory () {

        var queue = {
          addListener: [],
          once: [],
          forward: [],
          emit: []
        };

        /*jshint unused: false */
        var addListener = function (eventName, callback) {
          var array = Array.prototype.slice.call(arguments);
          queue.addListener.push(array);
        };

        var removeListener = function (eventName, fn) {
            if (fn) {
                for (var i = 0, len = queue.addListener.length; i < len; i++) {
                    if (queue.addListener[i][0] === eventName && queue.addListener[i][1] === fn) {
                        break;
                    }
                }
                queue.addListener.splice(i, 1);
            } else {
                // Remove every instance or just return?
            }
        };

        var removeAllListeners = function () {
            queue.addListener.length = 0;
            queue.once.length = 0;
        };

        var processDeferred = function (socket) {
          for (var key in queue) {
            var deferredCalls = queue[key];
            if (deferredCalls.length > 0) {
              /*jshint -W083 */
              deferredCalls.map(function (array) {

                var has = socket.hasOwnProperty(key);
                var fn = socket[key];

                socket[key].apply(null, array);
              });
            }
          }
          // Clear once and emit (as they are passed to the real socket)
          queue.once.length = 0;
          queue.emit.length = 0;
        };

        // Create our deferred wrapper
        return  {
          deferred: true,
          bootstrap: processDeferred,
          on: addListener,
          addListener: addListener,
          once: function (eventName, callback) {
            var array = Array.prototype.slice.call(arguments);
            queue.once.push(array);
          },
          emit: function(eventName, data, callback) {
            var array = Array.prototype.slice.apply(arguments);
            queue.emit.push(array);
          },
          removeListener: removeListener,
          removeAllListeners: removeAllListeners,
          disconnect: function () {
              throw new Error('Disconnect is not deferrable');
          },
          connect: processDeferred,
          //~ forward: is a wrapper event not a socket event
        };
      };
  });
