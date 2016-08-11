/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  announce: function (req, res) {

    // Get the session from the request
    var session = req.session;

    // Proceed only if the user is logged in
    if (session.me) {
      console.log("announce");
      User.findOne({id: session.me}).exec(function(err, user) {

        // Get the socket ID from the request
        var socketId = sails.sockets.getId(req);

        console.log("Socket ID: " + socketId);
        console.log("User ID: " + user.id);

        user.status = 'online';

        user.save(function(err) {
          // Publish this user creation event to every socket watching the User model via User.watch()
          User.publishCreate(user, req);
        });

        // Create the session.users hash if it doesn't exist already
        session.users = session.users || {};

        // Save this user in the session, indexed by their socket ID.
        // This way we can look the user up by socket ID later.
        session.users[socketId] = user;

        // Get updates about users being created
        User.watch(req);

        res.json(user);
      });
    }
  },

  chat: function (req, res) {
    sails.io.sockets.emit("chat", {verb:"messaged", data:{from: req.param('sender'), msg: req.param('msg')}});
  }
};

