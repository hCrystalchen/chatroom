// when the page is ready
$(document).ready(function() {
  var name = prompt("Please choose and enter a nickname", "Anonymous");
  // forces user to enter name
  while(name === null) {
      name = prompt("Please choose and enter a nickname", "Anonymous");
  }
  // set nickname in form to be the name entered
  document.form.nickname.value = name;

  // retrieve list of previously active rooms from server's database and append them to previously active list
  $.get('/previous', function(response) {
      var rooms = response.data;
      for(var i = 0; i < rooms.length; i++) {
          var name = rooms[i].name;
          if (name !== meta('roomName')) {
              var content = '<li><div class="prev_active_room">Chatroom:'+ name +'</div></li>';
              $('#prev_active_list').append(content);
          }
      }
      // subscribe click handler to each item in the previously ative list
      $('.prev_active_room').click(function(event) {
          // slice off the string "Chatroom:" from the div to return only the room identifier
          var room = event.target.innerText.slice(9);
          // redirect page to the room clicked
          window.location.replace('/' + room);
      });
  });

  // change and specify form's onsubmit behavior
  var messageForm = $('#messageForm').submit(sendMessage);
});

// make initial request to prevent the delay in showing message history when entering room
makeRequest();
// set up interval to refresh messages every 5 seconds
var interval = window.setInterval(makeRequest, 5000);

/*
 * Get all messages of the current room from database, clear the message history,
 * and repopulate it with retrieved messages
 */
function makeRequest() {
    var currentRoom = meta('roomName');
    $.get('/' + currentRoom + '/messages', function(res) {
        var messages = res.data;
        $('#history_list').empty();
        for(var i = 0; i < messages.length; i++) {
            var name = messages[i].nickname;
            var t = messages[i].time;
            var mes = messages[i].body;
            var content = '<li><div class="message_content"><div class="message_header"><h3>' + name + '</h3><p class="time">' + t + '</p></div><p>'+ mes +'</p></div></li>';
            $('#history_list').append(content);
            // keep list scrolled to bottom
            $('#history_list').animate({scrollTop: $('#history_list').prop("scrollHeight")}, 500);
        }
    });
}

/*
 * Send messages to server in a form, supresses the default behavior of the form which redirects the page
 */
function sendMessage(event) {
    // prevent the page from redirecting
    event.preventDefault();

    // get the parameters
    var name = document.form.nickname.value;
    var mes = document.form.message.value;
    var t = Date();

    // send them to the server
    $.post('/' + meta('roomName') + '/messages', {nickname: name, message: mes, time: t}, function(res){
        // append sent message immediately to history so that current user would see his/her OWN message immediately
        if (res.status === "ok")
            var content = '<li><div class="message_content"><div class="message_header"><h3>' + name + '</h3><p class="time">' + t + '</p></div><p>'+ mes +'</p></div></li>';
        else
            var content = '<p> FAILED TO TRANSMIT MESSAGE</p>'
        $('#history_list').append(content);
        // keep list scrolled to bottom
        $('#history_list').animate({scrollTop: $('#history_list').prop("scrollHeight")}, 500);
        // clear text input upon submission of form
        document.form.message.value = "";
    });
}

/*
 * Get certain meta tag
 */
function meta(name) {
    var tag = document.querySelector('meta[name=' + name + ']');
    if (tag != null) {
        return tag.content;
    }
    return '';
}
