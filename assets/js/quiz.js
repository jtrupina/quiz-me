io.socket.on('connect', function socketConnected() {
  console.log("QUIZ CONNECT");

  var myRoomID = null;
  var connectedPlayers = [];

  $("form").submit(function(event) {
    event.preventDefault();
  });
  $('#quiz-game').hide();

  io.socket.get('/quiz/subscribe', function (data) {
    if (!jQuery.isEmptyObject(data.rooms)) {
      $.each(data.rooms, function (id, room) {
        var html = "<button id=" + id + " class='joinRoomBtn btn btn-default btn-xs' >Join</button>" + " " + "<button id=" + id + " class='removeRoomBtn btn btn-default btn-xs'>Remove</button>";
        $('#available-quizzes').append("<li id=" + id + " class=\"list-group-item\"><span>" + room.name + "</span> " + html + "</li>");
      });
    } else {
      $("#available-quizzes").append("<li class='list-group-item'>There are no rooms yet.</li>");
    }
  });

  io.socket.on('quiz-list', function (data) {
    if (!jQuery.isEmptyObject(data.rooms)) {
      $("#available-quizzes").empty();
      $.each(data.rooms, function (id, room) {
        var html = "<button id=" + id + " class='joinRoomBtn btn btn-default btn-xs' >Join</button>" + " " + "<button id=" + id + " class='removeRoomBtn btn btn-default btn-xs'>Remove</button>";
        $('#available-quizzes').append("<li id=" + id + " class=\"list-group-item\"><span>" + room.name + "</span> " + html + "</li>");
      });
    } else {
      $("#available-quizzes").append("<li class='list-group-item'>There are no rooms yet.</li>");
    }
  });

  io.socket.on('message', function (data) {
    $('#main').hide();
    $('#quiz-game').show();
    $('#name').text("Quiz name: " + data.room.name);
    $('#category').text("Category: " + data.room.category);
    if(data.owns) {
      $('#start').append("<button id='start-quiz' class='btn btn-warning'>Let's roll!</button>")
    }
    window.room = data.room;
    window.me = data.user;
  });

  io.socket.on('user_joined', function (data) {
    console.log('user_joined');
    var user = data.user;
    if($.inArray(user.id, connectedPlayers) == -1) {
      $('#players').append('<li class="list-group-item" data-user-id=' + user.id + '>' + user.name + '</li>');

      // Add it to the connected users array
      connectedPlayers.push(user.id);
    }
  });

  io.socket.on('user_left', function (data) {
    var user = data.user;

    // Remove it from our connected users array
    connectedPlayers.splice(connectedPlayers.indexOf(user.id), 1);

    // Remove it from the list
    $('li[data-user-id="' + user.id + '"]').remove();
  });

  io.socket.on('startQuiz', function (data) {
    console.log("start quiz data: " + data);
    loadQuiz(data);
  });

  io.socket.on('generateScore', function (data) {
    console.log('generatinr score');
    generateScoreBoard();
  });

  io.socket.on('updateScore', function (data) {
    console.log('updating score');
    updateScoreBoard(data.user);
  });


  $("#createRoomBtn").click(function () {
    var roomExists = false;
    var roomName = $("#createRoomName").val();
    var category = $("#quiz-category").val();
    io.socket.post('/quiz/check', {name: roomName}, function (data) {
      roomExists = data.result;
      if (roomExists) {
      } else {
        if (roomName.length > 0) {
          io.socket.post('/quiz/create', {name: roomName, category: category}, function (data) {

          });
        }
      }
    });
  });

  $("#available-quizzes").on('click', '.joinRoomBtn', function() {
    var roomName = $(this).siblings("span").text();
    var roomID = $(this).attr("id");
    io.socket.post('/quiz/join', {roomID: roomID}, function (data) {
      $.each(data.people, function (key, user) {
        $('#players').append('<li class="list-group-item" data-user-id=' + user.id +'>' + user.name + '</li>');
        connectedPlayers.push(user.id);
      });
    });
  });

});

