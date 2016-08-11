$('#btn-input').keypress(function(e){
  if(e.which == 13){//Enter key pressed
    onClickSendPublicMessage();
  }
});

// Hook up the "send message" button
$('#btn-chat').click(onClickSendPublicMessage);

function writeMessage(senderName, message) {
  var chat = $('#public-chat');
  var currentdate = new Date();
  var message = currentdate.getHours() + ":" + ('0' + currentdate.getMinutes()).slice(-2) + " " + senderName+': '+message+'\n';
  chat.append(message);

  // Scroll to the bottom
  if(chat.length) {
    chat.scrollTop(chat[0].scrollHeight - chat.height());
  }
}

function receiveMessage(data) {
  writeMessage(data.from, data.msg)
}

function onClickSendPublicMessage() {
  var sendMessageButton = $('#btn-input');
  if (sendMessageButton.val() !== '') {
    sendMessage('', sendMessageButton.val());

    sendMessageButton.val('');
  }
}

function sendMessage(senderName, message) {
  io.socket.post('/chat/send', {sender: senderName, msg: message});
}
