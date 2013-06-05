/*
 * angular-socket-io v0.0.1
 * (c) 2013 Brian Ford http://briantford.com
 * License: MIT
 */

'use strict';

angular.module('btford.socket-io', []).
  factory('socket', function ($rootScope) {
    var socket = io.connect();
    return {
      on: function (eventName, callback) {
        socket.on(eventName, function () {  
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
      },
      emit: function () {
        if (arguments.length > 2){
          var callback = arguments[arguments.length - 1]    
        }
        // slightly more complex than the usual example
        // because it should took any length of arguments
        var ngcallback = function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        }
        var args = arguments
        Array.prototype.splice.call(arguments, arguments.length -1 ,1)
        Array.prototype.push.call(args, ngcallback)
        socket.emit.apply(socket, args)
      }
    };
  });
