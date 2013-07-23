# angular-socket-io
Bower Component for using AngularJS with [Socket.IO](http://socket.io/), based on [this](http://briantford.com/blog/angular-socket-io.html).


## Install

1. `bower install angular-socket-io` or [download the zip](https://github.com/btford/angular-socket-io/archive/master.zip).
2. Made sure the Socket.IO client lib is loaded. It's often served at `/socket.io/socket.io.js`.
3. Include the `socket.js` script provided by this component into your app.
4. Add `btford.socket-io` as a module dependency to your app.


## Usage

For the most part, this component works exactly like you would expect it to.
The only API addition is `socket.forward`, which makes it easier to add/remove listeners in a way that works with [AngularJS's scope](http://docs.angularjs.org/api/ng.$rootScope.Scope).

### `socket.on` / `socket.addListener`
Takes an event name and callback.
Works just like the method of the same name from Socket.IO.

### `socket.removeListener`
Takes an event name and callback.
Works just like the method of the same name from Socket.IO.

### `socket.emit`
Sends a message to the server.
Optionally takes a callback.

Works just like the method of the same name from Socket.IO.

### `socket.forward`

`socket.forward` allows you to forward the events recieved by Socket.IO's socket to AngularJS's event system.
You can then listen to the event with `$scope.$on`.
By default, socket-forwarded events are namespaced with `socket:`.

The first argument is a string or array of strings listing the event names to be forwarded.
The second argument is optional, and is the scope on which the events are to be broadcast.
If an argument is not provided, it defaults to `$rootScope`.
As a reminder, broadcasted events are propegated down to descendant scopes.

#### Examples

An easy way to make socket error events available across your app:

```javascript

// in the top-level module of the app
angular.module('myApp', [
  'btford.socket-io',
  'myApp.MyCtrl'
]).
run(function () {
  socket.forward('error');
});

// in one of your controllers
angular.module('myApp.MyCtrl', []).
  controller('MyCtrl', function ($scope) {
    $scope.on('socket:error', function (ev, data) {

    });
  });
```

Avoid dublicating event handlers when a user navigates back and forth between routes:

```javascript
angular.module('myMod', ['btford.socket-io']).
  controller('MyCtrl', function ($scope, socket) {
    socket.forward('someEvent', $scope);
    scope.$on('socket:someEvent', function (ev, data) {
      $scope.theData = data;
    });
  });
```

### `socketProvider.prefix`

This method changes the prefix for forwarded events.
The default prefix is `socket:`.

#### Example

To remove the prefix:

```javascript
angular.module('myApp', [
  'btford.socket-io'
]).
config(function (socketProvider) {
  socketProvider.prefix('');
});
```

### `socketProvider.ioSocket`

This method allows you to provide the `socket` service with a `Socket.IO socket` object to be used internally.
This is useful if you want to connect on a different path, or need to hold a reference to the `Socket.IO socket` object for use elsewhere.

```javascript
angular.module('myApp', [
  'btford.socket-io'
]).
config(function (socketProvider) {
  var mySocket = io.connect('/some/other/path');
  // do stuff with mySocket
  socketProvider.ioSocket(mySocket);
});
```


## License
MIT
