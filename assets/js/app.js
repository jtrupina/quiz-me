io.socket.on('connect', function socketConnected() {

  // List of all users
  var connectedUserIDs = [];

  io.socket.get('/chat/subscribe', function (data, jwr) {
    // We get a list of all connected users after subscribing and need to display them
    $.each(data, function (key, user) {
      $('#users-list').append('<li class="list-group-item" data-user-id=' + user.id +'>' + user.name + '</li>');
      connectedUserIDs.push(user.id);
    });

    // Handling user disconnects
    io.socket.on('user_left_chat', function(userId) {
      var userName = $('li[data-user-id="' + userId + '"]').html();

      // Remove it from our connected users array
      connectedUserIDs.splice(connectedUserIDs.indexOf(userId), 1);

      // Remove it from the list
      $('li[data-user-id="' + userId + '"]').remove();

      writeMessage('System', userName + ' left');
    });

    // Handling user connections
    io.socket.on('user_joined_chat', function(user) {
      // Only notify or add to list if the user is not in the users array
      if($.inArray(user.id, connectedUserIDs) == -1) {
        $('#users-list').append('<li class="list-group-item" data-user-id=' + user.id + '>' + user.name + '</li>');

        writeMessage('System', user.name + ' joined');

        // Add it to the connected users array
        connectedUserIDs.push(user.id);
      }
    });

    io.socket.on('new_message', function (data) {
      writeMessage(data.from, data.msg);
    });

    io.socket.on('disconnect', function socketDisconnected() {
      alert("test");
    })

  });



});
