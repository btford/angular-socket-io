## Deferred sockets

Useful for applications that doesn't connect on start, but wait for some user or system interaction.

Code in the application remain as usual (no promises are needed), a real socket can be later passed and even sockets can be swapped.

### Usage

Use exactly as you would use the original `socketFactory`, just pass the deferred socket instead. An extra methods is added to the original factory to replace / swap the socket.

Some application logic changes should be considered, i.e.
 - Application features that require connection, shouldn't be available before a real connection is made
 - Disconnect event is not available

#### Examples:

```javascript
deferred_socket = deferredSocketFactory();
socket = socketFactory( {
  scope: scope,
  ioSocket: deferred_socket
});
```
In you app use as usual

```javascript
socket.on('connect, function);
```

Swap your real socket when you're ready

```javascript
function connect(params){
 // do whatever you need to do
 var realSocket = io.connect();
 socket.swapSocket(realSocket) ;
}

function changeServer(newserver) {
  var newSocket = io.connect(newserver);
  socket.swapSocket(newSocket);
}
```

#### Notes

These changes are based on the work of @davisford but refactored to:

- Preserve original module (by @btford) functionality and operation nearly intact
- Allow swap sockets (between real io-sockets)
- Follow the same order and structure as original @btford module for easier maintenance
- Acts as an endpoint insted of modifying or rewrapping angular-socket-io
- Pass all tests, needs tests for socket swap (real socket for another real socket)
