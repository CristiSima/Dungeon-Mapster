from constants import GENERATED_DIR
from flask import Flask, render_template, request, redirect, make_response
from flask_socketio import SocketIO, emit
from threading import Lock

import os

from constants import DM_SECRET
from image_edit import save_images

async_mode = None
app = Flask(__name__)
app.config['SECRET_KEY'] = '9f962e1ffa116b1becfdf2581129012f71792a53a9493bb2ce466a4d32ef720f68974042066266ba4a948bed48d4d275bd21e49cbc39044000840d1da571368a'
socketio = SocketIO(app, async_mode=async_mode)
thread = None
thread_lock = Lock()

generated_path = []
CURENT_IMAGE = "static/images/dungeonmapster.png"
# CURENT_IMAGE="Show.png"


def require_localhost(route_method):
    '''
    if the request is not made with the loopback address, redirects to "/"
    '''

    def check_localhost(*args, **kwargs):
        if request.remote_addr == "127.0.0.1":
            return route_method(*args, **kwargs)
        else:
            return redirect("/", code=302)

    return check_localhost


def require_DM_SECRET(event_method):
    '''
    before the event_method is called, checks if the correct DM_SECRET is provided
    which is unnecessary but why not
    '''

    def check_DM_SECRET(json: dict):
        if("DM_SECRET" in json and json["DM_SECRET"] == DM_SECRET):
            return event_method(json)
        else:
            print(json)
            return

    return check_DM_SECRET


@app.route('/DM')
# @require_localhost
def DM():
    resp = make_response(render_template('DM_base.html', image_path=CURENT_IMAGE, async_mode=socketio.async_mode))
    resp.set_cookie("DM_SECRET", DM_SECRET)
    return resp


@app.route('/DM_select')
# @require_localhost
def DM_select():
    resp = make_response(render_template('DM_select.html', image_path=CURENT_IMAGE, async_mode=socketio.async_mode))
    resp.set_cookie("DM_SECRET", DM_SECRET)
    return resp


@app.route('/')
def index():
    localhost = request.remote_addr == "127.0.0.1"
    return render_template('update.html', localhost=localhost, image_path=CURENT_IMAGE, async_mode=socketio.async_mode)


@socketio.on("reveal")
@require_DM_SECRET
def reveal(msg: dict):
    save_images(msg["base_img"], msg["output"], msg["instructions"])
    # informs the DM(on ALL pannels) that a new img has been created
    emit("done_reveal", broadcast=True)
    pass


@socketio.on("get_images")
@require_DM_SECRET
def get_images(msg: dict):
    images = [filename for filename in os.listdir("static/images")]
    emit("get_images", images)


@socketio.on("get_generated")
@require_DM_SECRET
def get_generated(msg: dict):
    # filters duplicates of the images(pc and dm versions)
    generated = [filename for filename in os.listdir("static/generated") if "_PC" in filename]
    # removes "_DM.png"
    generated = [filename[:-7] for filename in generated]

    emit("get_generated", generated)


@socketio.on("change_image")
@require_DM_SECRET
def change_image(msg: dict):
    global CURENT_IMAGE

    CURENT_IMAGE = msg['new_src']
    # sends the event to ALL connected clients
    emit("change_image", {"new_src": msg["new_src"]}, broadcast=True)


if __name__ == '__main__':
    socketio.run(app, debug=True, host="0.0.0.0")
