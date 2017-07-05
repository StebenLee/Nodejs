let socket = io();
$('#send-message-btn').click(function() {
	let msg = $('#message-box').val();
	socket.emit('chat', msg);
	$('#messages').append($'<p>').text(msg));
	$('#messages-box').val('');
	return false;
});
socket.on('chat', function(name, msg) {
	$('#messages').append($'<p>').text(msg))
});