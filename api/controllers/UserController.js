/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  signup: function (req, res) {

    // Attempt to signup a user using the provided parameters
    User.signup({
      email: req.param('email'),
      password: req.param('password')
    }, function (err, user) {
      // res.negotiate() will determine if this is a validation error
      // or some kind of unexpected server error, then call `res.badRequest()`
      // or `res.serverError()` accordingly.
      if (err) return res.negotiate(err);

      // Go ahead and log this user in as well.
      // We do this by "remembering" the user in the session.
      // Subsequent requests from this user agent will have `req.session.me` set.
      req.session.me = user.id;
      req.session.email = user.email

      // If this is not an HTML-wanting browser, e.g. AJAX/sockets/cURL/etc.,
      // send a 200 response letting the user agent know the signup was successful.
      if (req.wantsJSON) {
        return res.ok('Signup successful!');
      }

      // Otherwise if this is an HTML-wanting browser, redirect to /welcome.
      return res.redirect('/');
    });
  },

  /**
   * `UserController.signin()`
   */
  signin: function (req, res) {

    // See `api/responses/login.js`
    return res.login({
      email: req.param('email'),
      password: req.param('password'),
      successRedirect: '/',
      invalidRedirect: '/signin'
    });
  },

  logout: function (req, res) {

    req.session.me = null;

    // If this is not an HTML-wanting browser, e.g. AJAX/sockets/cURL/etc.,
    // send a simple response letting the user agent know they were logged out
    // successfully.
    if (req.wantsJSON) {
      return res.ok('Logged out successfully!');
    }

    // Otherwise if this is an HTML-wanting browser, do a redirect.
    return res.redirect('/');
  },

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
    console.log("test: " + req.param('sender'));
    sails.io.sockets.emit("chat", {verb:"messaged", data:{from: req.param('sender'), msg: req.param('msg')}})
  }
};

