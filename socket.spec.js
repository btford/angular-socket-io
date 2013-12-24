/*
 * angular-socket-io v0.3.0
 * (c) 2014 Brian Ford http://briantford.com
 * License: MIT
 */

'use strict';


describe('socketFactory', function () {

  beforeEach(module('btford.socket-io'));

  var socket,
      scope,
      $timeout,
      $browser,
      mockIoSocket,
      spy;

  beforeEach(inject(function (socketFactory, _$browser_, $rootScope, _$timeout_) {
    $browser = _$browser_;
    $timeout = _$timeout_;
    scope = $rootScope.$new();
    spy = jasmine.createSpy('emitSpy');
    mockIoSocket = io.connect();
    socket = socketFactory({
      ioSocket: mockIoSocket,
      scope: scope
    });
  }));


  describe('#on', function () {

    it('should apply asynchronously', function () {
      socket.on('event', spy);

      mockIoSocket.emit('event');

      expect(spy).not.toHaveBeenCalled();
      $timeout.flush();

      expect(spy).toHaveBeenCalled();
    });

  });


  describe('#emit', function () {

    it('should call the delegate socket\'s emit', function () {
      spyOn(mockIoSocket, 'emit');

      socket.emit('event', {foo: 'bar'});

      expect(mockIoSocket.emit).toHaveBeenCalled();
    });

  });


  describe('#removeListener', function () {

    it('should not call after removing an event', function () {
      socket.on('event', spy);
      socket.removeListener('event', spy);

      mockIoSocket.emit('event');

      expect($browser.deferredFns.length).toBe(0);
    });

  });


  describe('#forward', function () {

    it('should forward events', function () {
      socket.forward('event');

      scope.$on('socket:event', spy);
      mockIoSocket.emit('event');
      $timeout.flush();

      expect(spy).toHaveBeenCalled();
    });

    it('should forward an array of events', function () {
      socket.forward(['e1', 'e2']);

      scope.$on('socket:e1', spy);
      scope.$on('socket:e2', spy);

      mockIoSocket.emit('e1');
      mockIoSocket.emit('e2');
      $timeout.flush();
      expect(spy.callCount).toBe(2);
    });

    it('should remove watchers when the scope is removed', function () {

      socket.forward('event');
      scope.$on('socket:event', spy);
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
        ioSocket: mockIoSocket,
        scope: scope,
        prefix: 'custom:'
      });

      socket.forward('event');

      scope.$on('custom:event', spy);
      mockIoSocket.emit('event');
      $timeout.flush();

      expect(spy).toHaveBeenCalled();
    }));

    it('should forward to the specified scope when one is provided', function () {
      var child = scope.$new();
      spyOn(child, '$broadcast');
      socket.forward('event', child);

      scope.$on('socket:event', spy);
      mockIoSocket.emit('event');
      $timeout.flush();

      expect(child.$broadcast).toHaveBeenCalled();
    });
  });

});
