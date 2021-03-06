var colors = ['green', 'red', 'blue', 'black', 'purple'];


$('#theme').hover(function(){
	//alert("hovered");
	$('#color-panel').fadeIn(500);

	if($('#theme').height()>40){
        $('#theme').css({'line-height':'100%'});
    }
},function(){
	$('#color-panel').hide();
	$('#theme').css({'line-height':'40px'});
});

$('.colors').hover(function() {
	 $(this).css('border-radius', '0%');
}, function() {
	 $(this).css('border-radius', '50%');
});

$('#green').click(function(){
	$('body').css({'background-color':'#DED'});
	$('#left_container').css({'background-color':'#1A6'});
	$('#messages').css({'background-color':'#DFE'});
	$('#chat-box').css({'background-color':'#BEA'});
	$('.tab-selected').css({'background-color':'#BFA'});
	$('#send-button').css({'background-color':'#8FD'});
});
$('#red').click(function(){
	$('body').css({'background-color':'#EDD'});
	$('#left_container').css({'background-color':'#A53'});
	$('#messages').css({'background-color':'#FDD'});
	$('#chat-box').css({'background-color':'#EBA'});
	$('.tab-selected').css({'background-color':'#FBA'});
	$('#send-button').css({'background-color':'#F8B'});
});
$('#blue').click(function(){
	$('body').css({'background-color':'#DDE'});
	$('#left_container').css({'background-color':'#56D'});
	$('#messages').css({'background-color':'#BCE'});
	$('#chat-box').css({'background-color':'#BAE'});
	$('.tab-selected').css({'background-color':'#BAF'});
	$('#send-button').css({'background-color':'#8DF'});
});
$('#black').click(function(){
	$('body').css({'background-color':'#444'});
	$('#left_container').css({'background-color':'#556'});
	$('#messages').css({'background-color':'#555'});
	$('#chat-box').css({'background-color':'#555'});
	$('.tab-selected').css({'background-color':'#333'});
	$('#send-button').css({'background-color':'#225'});
});
$('#purple').click(function(){
	$('body').css({'background-color':'#616'});
	$('#left_container').css({'background-color':'#92A'});
	$('#messages').css({'background-color':'#A7A'});
	$('#chat-box').css({'background-color':'#D5D'});
	$('.tab-selected').css({'background-color':'#C4C'});
	// $('.tab').hover(function() {
	// 	alert('1111');
	// 	$(this).css({'background-color':'#C4C'});
	// });
	$('#send-button').css({'background-color':'#FDF'});
});
$('#random').click(function(){
	$('body').css('background-color', getRandomColor());
	$('#left_container').css('background-color', getRandomColor());
	$('#messages').css('background-color', getRandomColor());
	$('#chat-box').css('background-color', getRandomColor());
	$('.tab-selected').css('background-color', getRandomColor());
	$('#send-button').css('background-color', getRandomColor());

	var x = Math.floor(Math.random() * 10);
	if(x < 6) {
		l();
	} else {
		dark();
	}
});
$('.light').click(function(){
	l();
});
$('.dark').click(function(){
	dark();
});

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function l() {	
	light = true;
	$('.tab-selected').css({'color':'black'});
	$('#user_id').css({'color':'black'});
	$('#send-button').css({'color':'black'});
	$('#messages').css({'color':'black'});
	for(var i=0; i<editors.length;i++){
		editors[i].updateOptions({'theme':'vs'});
	}
}

function dark() {
	light = false;
	$('.tab-selected').css({'color':'white'});
	$('#user_id').css({'color':'white'});
	$('#send-button').css({'color':'white'});
	$('#messages').css({'color':'white'});
	for(var i=0; i<editors.length;i++){
		editors[i].updateOptions({'theme':'vs-dark'});
	}	
}


