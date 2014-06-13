$(document).ready(function() {
	$(".loginBtn").click(function(e) {
		$.ajax({
	    url: "/users/login",
	    type: "POST",
	    data: {
	    	username: $(".usename").val(),
	    	password: $(".password").val()
	    }
	  }).done(function(){
	  	window.location = "/game";
	  }).fail(function(e) {
	  	alert("Wrong username or password");
	  });

	  e.preventDefault();
	  return false;
	})

	$(".registerBtn").click(function(e) {
		$.ajax({
	    url: "/users/register",
	    type: "POST",
	    data: {
	    	username: $(".usename").val(),
	    	password: $(".password").val()
	    }
	  }).done(function(){
	  	window.location = "/game";
	  }).fail(function(e) {
	  	alert("Username is already registered.");
	  });

	  e.preventDefault();
	  return false;
	})	
})

