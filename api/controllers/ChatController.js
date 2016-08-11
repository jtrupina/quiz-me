/**
 * ChatController
 *
 * @description :: Server-side logic for managing chats
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  render: function (req, res) {
    return res.view('chat/chat');
  },

  /**
   * Subscribes to the "chat_users_online" room
   *
   * The chat_users_online room is where all connected users are stored
   * @param req
   * @param res
   */
  subscribe: function (req, res) {
    console.log("USER SUBSCRIBED TO CHAT: " + req.session.me.email);
    // Get the session from the request
    var session = req.session;
    if(typeof req.session.me !== 'undefined') {
      sails.sockets.join(req.socket, 'chat_users_online');

      User.find(req.session.me.id).exec(function (err, user) {
        if( ! ChatConnectionService.isOnline(user[0])) {
          // Get the socket ID from the request
          var socketId = sails.sockets.getId(req);
          ChatConnectionService.addConnection(user[0]);

          sails.sockets.broadcast('chat_users_online', 'user_joined_chat', user[0]);

          session.user = user[0].id;
        }

        // Subscribing to the chat_users_online room returns a list of all connected users
        return res.json(ChatConnectionService.getConnectedUsers());
      });
    }
  },

  send: function (req, res) {
    sails.sockets.broadcast('chat_users_online', 'new_message', {from: req.session.me.name, msg: req.param('msg')});
  }
};

