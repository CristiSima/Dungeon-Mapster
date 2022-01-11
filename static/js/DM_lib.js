var socket = io();

var img_path="";

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
        }
    }
    return "";
}

function get_rects()
{
    json=[]
    for(var rect of rectangles)
    {
        json.push({
            "type":"rect",
            "args":[[rect.x,rect.y],[rect.x+rect.width,rect.y+rect.height]]
        })
    }
    return json
    console.log(json);
}

// creates a button that will call the provided function(with included arguments)
function get_button_calling(text,function_call)
{
    let a = document.createElement('button');
    a.textContent=text;
    a.setAttribute("onclick", function_call);

    return a;
}

let optionsList = document.getElementById("OptionUL");
// registers a new option
function add_option(name,function_call)
{
    let a = get_button_calling(name, function_call);
    optionsList.appendChild(document.createElement("li").appendChild(a));
    optionsList.appendChild(document.createElement("li").appendChild(document.createTextNode("    ")));
}

function clear_reveal()
{
    let boxes = document.getElementById("boxes");
    while(boxes.lastChild != null) {
        boxes.removeChild(boxes.lastChild);
        rectangles.splice(-1);
    }
}


function refill_list(elementId, function_name, data)
{
    let generatedList = document.getElementById(elementId);
    
    // clears the list
    while (generatedList.firstChild) {
        generatedList.removeChild(generatedList.firstChild);
    }

    // displaies all elements
    for (var i = 0; i < data.length; i = i+1) {
        if(data[i]=="temp")
            continue
        let a = get_button_calling(data[i], function_name+"(\""+data[i]+"\")");

        // spaces betwen elements
        generatedList.appendChild(document.createElement("li").appendChild(a));
        if (i+1 < data.length) {
            generatedList.appendChild(document.createElement("li").appendChild(document.createTextNode("    ")));
        }
    }
}

function on_get_images(data)
{
    refill_list("ImageUL","change_image",data)
}


// refill_list("GeneratedUL",change_image,data)
function on_get_generated(data)
{
    refill_list("GeneratedUL","change_PC_image",data)
}

function request_images()
{
    socket.emit("get_images",
    {
        "DM_SECRET":getCookie("DM_SECRET")
    });
}

function request_generated()
{
    socket.emit("get_generated",
    {
        "DM_SECRET":getCookie("DM_SECRET")
    });
}

function send_reveal(output)
{
    var json={
        "DM_SECRET":getCookie("DM_SECRET"),
        "instructions": get_rects(),
        "base_img":img_path.replace("%20", " "),
        "output":output
    }
    console.log(json)
    socket.emit("reveal",json)
}

const $ = document.querySelector.bind(document);

/**
 * Collection of rectangles defining user generated regions
 */
const rectangles = [];

// DOM elements
const $screenshot = $('#Image');
// const $draw = $('#draw');
// const $marquee = $('#marquee');
// const $boxes = $('#boxes');


function change_image(new_src)
{
    if(!new_src.includes("."))
    {
        new_src+=".png";
    }
    $screenshot.src="/static/imgs/"+new_src;
}

var showing="";
function show_generated(new_src)
{
    $screenshot.src="/static/generated/"+new_src+"_DM.png";
    showing=new_src;
}

function change_PC_image(new_src, PC_VERSION=true)
{
    var end_path="PC";
    if(!PC_VERSION)
        end_path="DM";
    new_src=new_src.replace("%20", " ")
    socket.emit("change_image",{
        "DM_SECRET": getCookie("DM_SECRET"),
        "new_src":"static/generated/"+new_src+"_"+end_path+".png"
    })
}

function Img_loaded()
{
    img_path=$screenshot.currentSrc.split("/").slice(5).join("/");

    $draw.width =$screenshot.width;
    $draw.height =$screenshot.height;
    console.log( "0 0 "+$screenshot.width+" "+$screenshot.height);
    $draw.setAttribute("width",$screenshot.width);
    $draw.setAttribute("height",$screenshot.height);
    $draw.setAttribute("viewBox", "0 0 "+$screenshot.width+" "+$screenshot.height);
}
