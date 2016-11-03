$(document).ready(function() {
	alert('Type in a song name. We will try to determine its genre from its chord sequence.')
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
		$("#result").html('This song belongs to ' + data + ' genre.');
		clearInterval(loading);
	} );
}