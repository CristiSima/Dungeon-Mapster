// function split_element(request)
// {
// 	return [request.slice(0,end=request.indexOf("|")),request.slice(request.indexOf("|")+1)]
// }

var Img=document.querySelector("#Image");
var socket = io();
// socket.on('connect', function() {
//     socket.emit('message', {data: 'I\'m connected!'});
// });

socket.on("change_image", json =>
{
	console.log(json)
	if(json['new_src'].includes("temp_PC.png"))
		Img.src="";
	Img.src=json['new_src']
})
// socket.addEventListener('message', function (event)
// {
// 	var id,data
// 	[command,data]=split_element(event.data)
//     switch (command)
//     {
//         case "execute":
//             data=eval(data)
//             socket.send(data);
//             break;
//         case "refresh":
//             var old=Img.src;
//             Img.src="";
//             Img.src=old;
//             socket.send("refreshed");
//             break;
//         default:
//             socket.send("UNK");
//     }
// });
// window.addEventListener('unload', function(event)
// {
// 	requester.Send("close",false)
// });
