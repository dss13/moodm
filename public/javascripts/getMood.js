$(document).ready(function() {
	alert('Type in a song name. We will try to determine the emotion from its chord sequence.')
	$("#submit").click(submitPressed);
	$(document).keypress(function(e){
	    if (e.which == 13){
	    	e.preventDefault();
	        submitPressed();
	    }
	});
});

var submitPressed = function() {
	var myStr = '.'
	var loading = setInterval(function() {
		$("#result").html('Getting data' + myStr);
		myStr += '.';
		if(myStr.length == 6) {
			myStr = '.';
		}
	}, 300);
	var search = $("#search").val();
	$.post( "/", { search: search }, function(data) {
		if(data == 'No match found'){
			$("#result").html(data + '. We will fix this soon');
		}
		else{
			$("#result").html('The emotion in the song is ' + data );
		}
		clearInterval(loading);
	} );
}
