/*
 * angular-socket-io v0.0.1
 * (c) 2013 Brian Ford http://briantford.com
 * License: MIT
 */

'use strict';

angular.module('btford.socket-io', []).
  factory('socket', function ($rootScope) {
    var safeApply = function(scope, fn) {
      if (scope.$$phase) {
        fn();
      } else {
        scope.$apply(fn);
      }
    };
    var socket = io.connect();
    return {
      on: function (eventName, callback) {
        socket.on(eventName, function () {
          var args = arguments;
          safeApply($rootScope, function () {
            callback.apply(socket, args);
          });
        });
      },
      emit: function (eventName, data, callback) {
        socket.emit(eventName, data, function () {
          var args = arguments;
          safeApply($rootScope, function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        });
      }
    };
  });
