import os
from copy import copy

from flask import Flask
from flask_cors import CORS
from flask import request, send_file

import json
from uuid import uuid4

from pathlib import Path

from video_streaming import get_video_file, convert_mp4_to_mp4h264

CLIPS_DATA_PATH = "./clips"

app = Flask(__name__)
CORS(
    app,
    origins = ["http://localhost:3000"]
)

app.config["UPLOAD_EXTENSIONS"] = [".mp4", ".jpg", "png", "webm"]
#app.config["MAX_CONTENT_LENGTH"] = 65 * 1024 * 1024

def fail_with(msg):
    return {
        "status": 0,
        "message": msg,
    }

def random_video_id(filename):
    id = str(uuid4()).replace('-', '')
    return id + filename


@app.route('/edit/subclip', methods=['PSOT'])
def subclip():
    decoded = request.data.decode('utf-8')
    request_json = json.loads(decoded)
    video_id = request_json["video_id"]
    print(request_json)

    video_path = os.path.join(CLIPS_DATA_PATH, str(video_id))

    if (os.path.exists(video_path) is False):
        return fail_with("No such video")

    return send_file(video_path)

# @app.route("/upload_from_link", methods=["POST"])
# def process_link_sot():

#     if 'video_link' not in request.form:
#         return json.dumps(fail_with("No Video Link"))
#     video_link = request.form["video_link"]

#     responseJSON = {
#         "request": {
#             "video_link": video_link,
#         },
#         "video_id": video_id,
#         "status": "success",
#     }
#     return json.dumps(responseJSON)

@app.route("/upload_video", methods=["POST"])
def upload_video():
    video_file = request.files.get("video_file", None)
    video_filename = request.form.get("video_filename", None)
    
    if video_file is None:
        return json.dumps(fail_with("No Video File"))

    video_filename = None
    if video_filename is None:
        video_filename = video_file.filename

    video_id = random_video_id(video_filename)

    video_path = Path(CLIPS_DATA_PATH) / (str(video_id))
    print(video_path)
    video_file.save(video_path)
    if str(video_path).endswith(".mp4"):
        video_path, video_id = convert_mp4_to_mp4h264(str(video_path), video_id)
        video_path = Path(video_path)
    print(video_path)
    
    responseJSON = {
        "request": {
            "video_filename": video_filename,
        },
        "video_id": video_id,
        "status": 1,
    }
    return json.dumps(responseJSON)

@app.route("/video/<video_id>", methods=["GET"])
def send_video(video_id):
    try:
        video_path = os.path.join(CLIPS_DATA_PATH, str(video_id))
        #range_header = request.headers.get('Range', None)
        #return get_video_file(video_path, range_header)
        return send_file(video_path)
    except:
        return "Video not found", 400

@app.after_request
def after_request(response):
    response.headers.add('Accept-Ranges', 'bytes')
    return response

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=7777, threaded=True)