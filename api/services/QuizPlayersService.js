/**
 * Very simple implementation of a connection manager service for available playerzes
 */

module.exports = {
  players: {},

  addPlayer: function(player) {
    this.players[player.id] = player;
  },

  isPlaying: function(player) {
    if(typeof player == 'number') {
      if(player in this.players) {
        return true;
      }
      return false;
    }

    if(typeof player !== 'undefined' && player.id in this.players) {
      return true;
    }

    return false;
  },

  getPlayers: function() {
    return this.players;
  },

  removePlayer: function(id) {
    delete this.players[id];
  },

  getPlayer: function (id) {
    return this.players[id];
  },

  getPlayersById: function (id) {
    quizPlayers = {};


  }
};

