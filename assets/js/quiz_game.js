var jsonData = null;
var questions = [];
var secondsToStart = 10;
var secondsToAnswer = 10;
var secondsToWait = 3;
var interval = 0;
var current = 0;

function generateSequence() {
  // Get the quiz questions from the selected JSON file
  $.getJSON('/data/javascript.json', function (obj) {

    self.jsonData = obj;
    var size = obj.questions.length;
    var requestedSize = 5;//parseInt($('#amount').val());
    var sequence, dummyArray = [];

    // Limit the quiz size to the amount of available questions
    if (requestedSize > size) requestedSize = size;

    // Get an array with numbers as big as the json file
    for (var i = 0; i < size; i++) {
      dummyArray[i] = i;
    }

    // Shuffle the array and get a slice of it
    dummyArray = self.shuffle(dummyArray);
    sequence = dummyArray.slice(0, requestedSize);

    io.socket.post("/quiz/start", {sequence: sequence, room: window.room}, function (data) {

    });
  });
}

function loadQuiz(data) {
  $('#quiz').show();

  // Check if we still don't have the generated sequence of questions
  if (self.questions.length === 0) {
    self.questions = data.sequence;
  }

  console.log("PITANJA:" + self.questions);

  if (self.jsonData === null) {
    $.getJSON('/data/javascript.json', function (obj) {
      self.jsonData = obj;
      console.log(jsonData);
      setupQuiz();
    });
  }
  else {
    console.log("JSON;" + jsonData.title);
    setupQuiz();
  }
}

function setupQuiz() {
  console.log("UŠLI SMO U SETUP QUIZ");
  $('#questions tr').remove();
  countDown($('#countdown'), secondsToStart, 'startQuiz');
}

function countDown($element, seconds, stage) {
  //$('#quiz-message').html('QUIZ WILL START IN: ');
  clearInterval(self.interval);
  interval = setInterval(function () {

    if (seconds > 0) {
      $element.html(seconds);
      seconds--;
    }
    else {
      $element.html('');
      clearInterval(interval);
      countDownByStage(stage);
    }
  }, 1000);
}

function countDownByStage(stage) {
  switch(stage) {
    case 'startQuiz':
      $('#countdown').removeClass('start');
      loadQuestion();
      break;
    case 'waitTime':
      console.log("waittime");
      resolveQuestion();
      break;
    case 'nextQuestion':
      loadQuestion();
      break;
    case 'finish':
      finishQuiz();
      break;

  }
}

function loadQuestion() {
  $('#question').html('<strong>Question: </strong>' + self.jsonData.questions[self.questions[self.current]].question);
  $('#questions tr').remove();

  $.each(self.jsonData.questions[self.questions[self.current]].answers, function (key, value) {
    $('#questions').append('<tr><td class="button"><input type="radio" name="answer" value="' + key + '"></td><td>' + value + '</td></tr>');
  });

  // Update status and countdown
  $('#quiz-message').html('Seconds remaining to answer: ');
  //$('#question-winner').html('');
  countDown($('#countdown'), self.secondsToAnswer, 'waitTime');
}

function checkAnswer() {
  //This user cannot answer this question anymore
  $('#questions .button input').attr('disabled', 'disabled');

  var radioButtons = $("#questions input:radio[name='answer']");
  var selectedAnswer = radioButtons.index(radioButtons.filter(':checked'));

  var correctAnswer = self.jsonData.questions[self.questions[self.current]].correct_answer;

  if (selectedAnswer >= 0 && selectedAnswer === parseInt(correctAnswer)) {
    console.log("TOČNO");
    io.socket.post('/quiz/score', {id: 'update', user: me.id, room: window.room}, function (data) {

    });
    $('#questions tr').eq(correctAnswer).addClass('success');
  } else {
    console.log("NETOČNO");
    $('#questions tr').eq(selectedAnswer).addClass('danger');
  }
}

function resolveQuestion() {
  $('#quiz-message').html('Next question in... ');
  $('#questions .button input').attr('disabled', 'disabled');

  var radioButtons = $("#questions input:radio[name='answer']");
  var selectedAnswer = radioButtons.index(radioButtons.filter(':checked'));

  var correctAnswer = self.jsonData.questions[self.questions[self.current]].correct_answer;
  $('#questions tr').eq(correctAnswer).addClass('success');

  if (selectedAnswer >= 0 && selectedAnswer !== parseInt(correctAnswer)) {
    $('#questions tr').eq(selectedAnswer).addClass('danger');
  }

  // Update questions index and gameplay
  var quizQuestions = parseInt($('#amount').val());

  if (self.current < 5) {
    self.current++;
    //$('#progress').val(self.current);

    if (self.current === 5) { //We reached the end of the quiz
      self.countDown($('#countdown'), self.secondsToWait, 'finish');
    }
    else {
      self.countDown($('#countdown'), self.secondsToWait, 'nextQuestion');
    }
  }
}

function finishQuiz() {
  console.log("FINISH QUIZ;")
  $('#quiz').hide();
  $('#winner').show();

  var scores = [];
  var players = [];

  $('#status-table tbody tr').each(function() {
    scores.push(parseInt($(this).find('.score').html()));
    players.push($(this).find('.name').html());
  });

  var highScore = Math.max.apply(Math, scores);
  var scoreIndex = scores.indexOf(highScore);
  var isDraw = false;

  $('#status-table tbody tr').each(function(index) {
    if (parseInt($(this).find('.score').html()) === highScore && scoreIndex !== index) isDraw = true;
  });

  if (highScore > 0) {
    if (isDraw) {
      $('#winner-message').html('We have a draw. Well done!');
    }
    else {
      $('#winner-message').html('And the winner is... <strong>' + players[scoreIndex] + '</strong>!');
    }
  }
  else {
    $('#winner-message').html('And the winner is... <strong>no one</strong> :-(');
  }
}

function shuffle(o) {
    //+ Jonas Raoni Soares Silva
    //@ http://jsfromhell.com/array/shuffle [v1.0]
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

$('#start').on('click', function() {
  alert("KVIZ JE STARTAN");
  $('#questions tr').remove();
  io.socket.post('/quiz/score', {id: 'generate', room: window.room}, function (data) {

  });
  generateSequence();
});

function generateScoreBoard() {
  $('#players li').each(function() {
    var userID = $(this).attr('data-user-id');
    var userName = $(this).text();
    var $table = $('#status-table');
    //var ready = (user.id == me.id) ? '<button type="button" id="changeStatus" class="btn btn-default btn-xs">change</button>' : '';
    var row = '<tr id="user-'+userID+'"><td class="name">'+userName+'</td><td class="score">0</td></tr>';
    $table.append(row);
  });
}

function updateScoreBoard(id) {
  $('#status-table tr').each(function() {
    var hasUser = $(this).attr('id');

    if (hasUser !== undefined && ('user-' + id == hasUser)) {
      var newScore = parseInt($(this).find('.score').html()) + 1;
      $(this).find('.score').html(newScore);
    }
  });
}

$('#questions').on('click', 'input[name="answer"]', function() {
  if ($(this).attr('disabled') !== 'disabled') {
    checkAnswer();
  }
});
