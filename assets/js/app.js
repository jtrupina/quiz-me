io.socket.on('connect', function socketConnected() {
  console.log("SOCKET CONNECT");

  io.socket.get("/user/announce", function(data){
    window.me = data;

    // Get the current list of users online.  This will also subscribe us to
    // update and destroy events for the individual users.
    io.socket.get('/user', updateUserList);
    io.socket.post('/user/chat', {sender: 'System', msg: data.email + ' joined'});

  });

  // Listen for the "user" event, which will be broadcast when something
  // happens to a user we're subscribed to.  See the "autosubscribe" attribute
  // of the User model to see which messages will be broadcast by default
  // to subscribed sockets.
  io.socket.on('user', function messageReceived(message) {

    switch (message.verb) {

      // Handle user creation
      case 'created':
        addUser(message.data);
        break;

      // Handle user destruction
      case 'destroyed':
        removeUser(message.id);
        break;

      default:
        break;
    }

  });

  io.socket.on('chat', function messageReceived(message) {

    switch (message.verb) {
      case 'messaged': receiveMessage(message.data); break;
      default: break;
    }
  });
});
