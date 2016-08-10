// Add a user to the list of available users to chat with
function addUser(user) {

  var found = false;

  // Check if the user is already in the table
  $('#users-list li').each(function() {
    var hasUser = $(this).attr('id');

    if (hasUser !== undefined && ('user-' + user.id == hasUser)) {
      found = true;
    }
  });

  if(!found) {
    // Get a handle to the user list <select> element
    var list = $('#users-list');

    // Create a new <option> for the <select> with the new user's information
    var item = $('<li class="list-group-item" id="'+"user-"+user.id+'">'+(user.email == "unknown" ? "User #" + user.id : user.email)+'</li>');

    // Add the new <option> element
    list.append(item);
  }

}

// Remove a user from the list of available users to chat with, by sending
// either a user object or a user ID.
function removeUser(user) {

  // Get the user's ID.
  var id = user.id || user;

  var userName = $('#user-'+id).text();

  // Remove the corresponding element from the users list
  var userEl = $('#user-'+id).remove();

}

// Add multiple users to the users list.
function updateUserList(users) {
  users.forEach(function(user) {
    if ((user.id == me.id) || (user.status === 'offline')) {return;}
    addUser(user);
  });
}
