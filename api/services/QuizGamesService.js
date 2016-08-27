/**
 * Very simple implementation of a connection manager service for available quizzes
 */

module.exports = {
  availableQuizzes: {},

  addQuizGame: function(quiz) {
    this.availableQuizzes[quiz.id] = quiz;
  },

  isAvailable: function(quiz) {
    if(typeof quiz == 'number') {
      if(quiz in this.availableQuizzes) {
        return true;
      }
      return false;
    }

    if(typeof quiz !== 'undefined' && quiz.id in this.availableQuizzes) {
      return true;
    }

    return false;
  },

  getAvailableQuizzes: function() {
    return this.availableQuizzes;
  },

  removeQuizGame: function(id) {
    delete this.availableQuizzes[id];
  },

  getAvailableQuiz: function (id) {
    return this.availableQuizzes[id];
  }
};
