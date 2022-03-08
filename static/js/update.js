var Img = document.querySelector("#Image");

var OPERATION_MODE;
try {
	var socket = io();
	OPERATION_MODE="socketio"
} catch (e) {
	alert("problems with sockets\nNo wories HTTP got your back");
	OPERATION_MODE="HTTP";
}


function change_image(json)
{
	console.log(json)
	if (json['new_src'].includes("temp_PC.png"))
		Img.src = "";
	Img.src = json['new_src']
}


if(OPERATION_MODE=="socketio")
	socket.on("change_image", change_image)
else
{
	var HTTP_FALLBACK_DELAY=5000; // in ms
	var last_update=0;
	var oReq = new XMLHttpRequest();

	oReq.onload = function(e) {
		var json = oReq.response; // not responseText
		console.log(json)
		if(last_update<json['last_update'])
		{
			last_update=json['last_update']
			change_image(json);
		}
		setTimeout(get_update, HTTP_FALLBACK_DELAY)
	}
	oReq.responseType = "json";

	function get_update()
	{
		oReq.open("GET", "http://192.168.0.200:5000/current_image");
		oReq.send();
	}
	get_update()
}
