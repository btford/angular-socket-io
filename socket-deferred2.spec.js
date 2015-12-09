/*
 * angular-socket-io v0.4.1
 * (c) 2014 Brian Ford http://briantford.com
 * License: MIT
 *
 * This test all methods again, allowing the deferred socket to testing events, and replacing it before checking results
 * * We test that the methods are correctly passed into the real socket,
 * Socket is swapped before direct calls to the mockIOSocket (or testing events would not be registered)
 */

'use strict';


describe('deferredSocketFactory-B', function () {

  beforeEach(module('btford.socket-io'));

  var socket,
      scope,
      $timeout,
      $browser,
      mockIoSocket,
      spy,
      deferred_socket;

  beforeEach(
    inject(function (socketFactory, _$browser_, $rootScope, _$timeout_, deferredSocketFactory) {
      $browser = _$browser_;
      $timeout = _$timeout_;
      scope = $rootScope.$new();
      spy = jasmine.createSpy('emitSpy');

      // Create the socket for testing, but don't replace until after use
      mockIoSocket = io.connect();

      // Use a deferred socket instead
      deferred_socket = deferredSocketFactory();

      // Now pass our socket using the standard options
      socket = socketFactory({
        ioSocket: deferred_socket,// mockIoSocket,
        scope: scope
      });
    })
  );




  describe('#on', function () {

    it('should apply asynchronously', function () {
      socket.on('event', spy);

      socket.swapSocket(mockIoSocket);

      mockIoSocket.emit('event');
      expect(spy).not.toHaveBeenCalled();
      $timeout.flush();
      expect(spy).toHaveBeenCalled();
    });

  });


  describe('#disconnect', function () {

    it('should call the underlying socket.disconnect', function () {
      mockIoSocket.disconnect = spy;
      socket.swapSocket(mockIoSocket); // Disconnect event is only possible on a real socket
      socket.disconnect();
      expect(spy).toHaveBeenCalled();
    });

  });


  describe('#once', function () {

    it('should apply asynchronously', function () {
      socket.once('event', spy);
      socket.swapSocket(mockIoSocket);

      mockIoSocket.emit('event');

      expect(spy).not.toHaveBeenCalled();
      $timeout.flush();

      expect(spy).toHaveBeenCalled();
    });

    it('should only run once', function () {
      var counter = 0;
      socket.once('event', function () {
        counter += 1;
      });

      socket.swapSocket(mockIoSocket);
      mockIoSocket.emit('event');
      mockIoSocket.emit('event');
      $timeout.flush();

      expect(counter).toBe(1);
    });

  });


  describe('#emit', function () {

    it('should call the delegate socket\'s emit', function () {
      spyOn(mockIoSocket, 'emit');

      socket.emit('event', {foo: 'bar'});

      socket.swapSocket(mockIoSocket);
      expect(mockIoSocket.emit).toHaveBeenCalled();
    });

    it('should allow multiple data arguments', function () {
      spyOn(mockIoSocket, 'emit');
      socket.emit('event', 'x', 'y');

      socket.swapSocket(mockIoSocket);
      expect(mockIoSocket.emit).toHaveBeenCalledWith('event', 'x', 'y');
    });

    it('should wrap the callback with multiple data arguments', function () {
      spyOn(mockIoSocket, 'emit');
      socket.emit('event', 'x', 'y', spy);

      socket.swapSocket(mockIoSocket);
      expect(mockIoSocket.emit.mostRecentCall.args[3]).toNotBe(spy);

      mockIoSocket.emit.mostRecentCall.args[3]();
      expect(spy).not.toHaveBeenCalled();
      $timeout.flush();

      expect(spy).toHaveBeenCalled();
    });

  });


  describe('#removeListener', function () {

    it('should not call after removing an event', function () {
      socket.on('event', spy);
      socket.removeListener('event', spy);
      socket.swapSocket(mockIoSocket);       // Only real socket support removal

      mockIoSocket.emit('event');

      expect($browser.deferredFns.length).toBe(0);
    });

  });


  describe('#removeAllListeners', function () {

    it('should not call after removing listeners for an event', function () {
      socket.on('event', spy);
      socket.removeAllListeners('event');

socket.swapSocket(mockIoSocket);       // Inject the actual socket

      mockIoSocket.emit('event');
      expect($browser.deferredFns.length).toBe(0);
    });

    it('should not call after removing all listeners', function () {
      socket.on('event', spy);
      socket.on('event2', spy);
      socket.removeAllListeners();

socket.swapSocket(mockIoSocket);       // Inject the actual socket

      mockIoSocket.emit('event');
      mockIoSocket.emit('event2');

      expect($browser.deferredFns.length).toBe(0);
    });

  });


  describe('#forward', function () {

    it('should forward events', function () {
      socket.forward('event');

      scope.$on('socket:event', spy);

      socket.swapSocket(mockIoSocket);       // Inject the actual socket
      mockIoSocket.emit('event');


      $timeout.flush();

      expect(spy).toHaveBeenCalled();
    });

    it('should forward an array of events', function () {
      socket.forward(['e1', 'e2']);

      scope.$on('socket:e1', spy);
      scope.$on('socket:e2', spy);

      socket.swapSocket(mockIoSocket);       // Inject the actual socket
      mockIoSocket.emit('e1');
      mockIoSocket.emit('e2');

      $timeout.flush();
      expect(spy.callCount).toBe(2);
    });

    it('should remove watchers when the scope is removed', function () {

      socket.forward('event');
      scope.$on('socket:event', spy);

      socket.swapSocket(mockIoSocket);       // Inject the actual socket

      mockIoSocket.emit('event');
      $timeout.flush();

      expect(spy).toHaveBeenCalled();

      scope.$destroy();
      spy.reset();
      mockIoSocket.emit('event');
      expect(spy).not.toHaveBeenCalled();
    });

    it('should use the specified prefix', inject(function (socketFactory) {
      var socket = socketFactory({
        //~ ioSocket: mockIoSocket,
        ioSocket: deferred_socket,
        scope: scope,
        prefix: 'custom:'
      });

      socket.forward('event');

      scope.$on('custom:event', spy);

      socket.swapSocket(mockIoSocket);

      mockIoSocket.emit('event');

      $timeout.flush();

      expect(spy).toHaveBeenCalled();
    }));

    it('should forward to the specified scope when one is provided', function () {
      var child = scope.$new();
      spyOn(child, '$broadcast');
      socket.forward('event', child);

      scope.$on('socket:event', spy);
      socket.swapSocket(mockIoSocket);       // Inject the actual socket

      mockIoSocket.emit('event');

      $timeout.flush();

      expect(child.$broadcast).toHaveBeenCalled();
    });
  });

});
