/**
 * QuizController
 *
 * @description :: Server-side logic for managing quizzes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Room = require('../helpers/quiz.js');
var uuid = require('node-uuid');

module.exports = {
  render: function (req, res) {
    return res.view('quiz/quiz');
  },

  check: function (req, res) {
    var match = false;
    var rooms = QuizGamesService.getAvailableQuizzes();
    _.find(rooms, function (key, value) {
      if(key.name === req.param('name'))
        return match = true;
        });

      return res.json({result: match});
  },

  create: function (req, res) {
    var id = uuid.v4();
    var room = new Room(req.param('name'), req.param('category'), id, req.session.me.id);
    QuizGamesService.addQuizGame(room);
    rooms = QuizGamesService.getAvailableQuizzes();
    sizeRooms = _.size(rooms);
    sails.sockets.broadcast(sails.sockets.getId(req), {room: room, user: req.session.me, owns: 'yes'});
    sails.sockets.broadcast(sails.sockets.getId(req), 'user_joined', {room: room, user: req.session.me});
    sails.sockets.broadcast('available-quizzes', 'quiz-list', {rooms: rooms, count: sizeRooms}, req.socket);
    sails.sockets.join(req.socket, id);
    room.addPerson(req.session.me.id);
    var user = req.session.me;
    QuizPlayersService.addPlayer({id: user.id, name: user.name, owns: id, inroom: id, socket: sails.sockets.getId(req)});

  },

  subscribe: function (req, res) {
    sails.sockets.join(req.socket, 'available-quizzes');
    rooms = QuizGamesService.getAvailableQuizzes();
    sizeRooms = _.size(rooms);
    return res.json({rooms: rooms, count: sizeRooms});
  },

  activateQuiz: function (req, res) {
    var quiz = QuizGamesService.getAvailableQuiz(req.param('id'));
    if(typeof quiz !== 'undefined') {
      console.log(quiz);
      return res.view('quiz/quiz_game', quiz);
    }
    return res.notFound();
  },

  join: function (req, res) {
    console.log("USER: " + req.session.me.email + ' joined quiz: ' + req.param('roomID'));
    var room = QuizGamesService.getAvailableQuiz(req.param('roomID'));
    console.log("ROOM:" + room);
    sails.sockets.broadcast(sails.sockets.getId(req), {room: room, user: req.session.me});
    sails.sockets.join(req.socket, room.id);
    room.addPerson(req.session.me.id);
    var user = req.session.me;
    QuizPlayersService.addPlayer({id: user.id, name: user.name, owns: "", inroom: room.id, socket: sails.sockets.getId(req)});
    sails.sockets.broadcast(room.id, 'user_joined', {user: req.session.me}, req.socket);
    var people = room.people;
    console.log(room.people);
    console.log("----");
    var quizPeople = [];
    for (i=0;i<people.length;i++) {
      quizPeople.push(QuizPlayersService.getPlayer(people[i]));
    }
    return res.json({people: quizPeople});

  },

  start: function (req, res) {
    console.log("QUIZ HAS STARTED");
    var room = req.param('room');
    sails.sockets.broadcast(room.id, 'startQuiz',{room: room, sequence: req.param('sequence')})
  },

  score: function (req, res) {
    console.log('generating scoreboard');
    var room = req.param('room');
    switch (req.param('id')) {
      case 'generate':
        sails.sockets.broadcast(room.id, 'generateScore', {id: 'generate'});
            break;
      case 'update':
        sails.sockets.broadcast(room.id, 'updateScore', {user: req.param('user')});
        break;
    }
  }
};

