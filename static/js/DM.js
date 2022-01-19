add_option("Save reveal", "send_reveal(prompt())");
add_option("Clear reveal", "clear_reveal()");
var will_show = false;
function check_show_now() {
    console.log("check_show_now")
    if (will_show) {
        change_PC_image("temp");
        will_show = false;
    }
}
function show_now() {
    will_show = true;
    send_reveal("temp");
}
add_option("Show Reveal", "show_now()");

add_option("     ", "")
add_option("Goto reveals", "window.location.pathname=\"/DM_select\"");


socket.on("get_images", on_get_images);

socket.on("get_generated", on_get_generated);

request_images();
// setTimeout(request_images, 1);

request_generated();
// setTimeout(request_generated, 1);

function send_reveal(output) {
    var json = {
        "DM_SECRET": getCookie("DM_SECRET"),
        "instructions": get_rects(),
        "base_img": img_path,
        "output": output
    }
    console.log(json)
    socket.emit("reveal", json)
}

socket.on("done_reveal", data => {
    request_generated();
    check_show_now();
});


// code for drag selection

// DOM elements
const $draw = $('#draw');
const $marquee = $('#marquee');
const $boxes = $('#boxes');

// Temp variables
let startX = 0;
let startY = 0;
const marqueeRect = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
};

$screenshot.addEventListener('load', (event) => {
    Img_loaded();
});
setTimeout(Img_loaded, 500);

$marquee.classList.add('hide');
$screenshot.addEventListener('pointerdown', startDrag);

document.addEventListener('keydown', (ev) => {
    if (ev.code == "KeyZ") {
        let boxes = document.getElementById("boxes");
        if (boxes.lastChild != null) {
            boxes.removeChild(boxes.lastChild);
            rectangles.splice(-1);
        }
    }
})

// box selection
function startDrag(ev) {
    // middle button delete rect
    if (ev.button === 1) {
        const rect = hitTest(ev.layerX, ev.layerY);
        if (rect) {
            rectangles.splice(rectangles.indexOf(rect), 1);
            redraw();
        }

        return;
    }

    window.addEventListener('pointerup', stopDrag);
    $screenshot.addEventListener('pointermove', moveDrag);
    $marquee.classList.remove('hide');
    startX = ev.layerX;
    startY = ev.layerY;
    drawRect($marquee, { x: startX, y: startY, width: 0, height: 0 });
}

function stopDrag(ev) {
    $marquee.classList.add('hide');
    window.removeEventListener('pointerup', stopDrag);
    $screenshot.removeEventListener('pointermove', moveDrag);

    if (ev.target === $screenshot && marqueeRect.width && marqueeRect.height) {
        rectangles.push(Object.assign({}, marqueeRect));
        redraw();
        marqueeRect.width = 0;
        marqueeRect.height = 0;
    }
}

function moveDrag(ev) {
    let x = ev.layerX;
    let y = ev.layerY;
    let width = startX - x;
    let height = startY - y;

    if (width < 0) {
        width *= -1;
        x -= width;
    }

    if (height < 0) {
        height *= -1;
        y -= height;
    }

    Object.assign(marqueeRect, {
        x,
        y,
        width,
        height
    });

    drawRect($marquee, marqueeRect);
}

function hitTest(x, y) {
    return rectangles.find(rect => (
        x >= rect.x &&
        y >= rect.y &&
        x <= rect.x + rect.width &&
        y <= rect.y + rect.height
    ));
}

function redraw() {
    boxes.innerHTML = '';
    rectangles.forEach((data) => {
        boxes.appendChild(drawRect(
            document.createElementNS("http://www.w3.org/2000/svg", 'rect'), data
        ));
    });
}

function drawRect(rect, data) {
    var {
        x,
        y,
        width,
        height
    } = data;

    x -= $screenshot.offsetTop;
    rect.setAttributeNS(null, 'width', width);
    rect.setAttributeNS(null, 'height', height);
    rect.setAttributeNS(null, 'x', x);
    rect.setAttributeNS(null, 'y', y);
    return rect;
}
