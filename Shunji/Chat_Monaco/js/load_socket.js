var socket = io();

$(document).ready(socket_function);

function socket_function(){

   socket.emit('new-user', "kkk");
    // send message
    $('form#send').submit(function(){
       var id = $('#my_name').text();
       msg =  id + ": " + $('#m').val();
       socket.emit('chat message', msg); 
       $('#m').val('');
       return false;
    });

    socket.on('chat message', function(msg){  
       $('#messages').append($('<li>').text(msg));
    });


    socket.on('current user', function(current){
        var currentstring=current.toString();
        $('#currentcount').html(currentstring);
    });

    // when there is user name change, emit user event to server
    $('form#user_form').submit(function(){  
       var name = $('#user_name').val();
       $('#user_name').val('');
       $('#my_name').html(name);    // set user name
       socket.emit('user', name); 

       return false;
    });

    socket.on('update_user', function(users){  // users is an array containing all user names
        console.log('update_user()!!')
        $('#online_users').html("")
        users.forEach( function(user, index) {
            $('#online_users').append($('<li>').attr('id', user).text(user)); // update the online users
       });
    });


    // default name
    /*
    name = "ShaB" + Math.floor(Math.random() * 20);
    $('#name').html(name); 
    $('#prev').text(name);
	socket.emit('user', {name: name, del: ""});
    */

   
    

}









