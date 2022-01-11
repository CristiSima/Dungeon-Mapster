add_option("Show PC","change_PC_image(showing)");

socket.on("get_generated", data=>refill_list("GeneratedUL","show_generated",data));

request_generated();

function send_reveal(output)
{
    var json={
        "DM_SECRET":getCookie("DM_SECRET"),
        "instructions": get_rects(),
        "base_img":img_path,
        "output":output
    }
    console.log(json)
    socket.emit("reveal",json)
}

socket.on("done_reveal", data => {
    request_generated();
});
