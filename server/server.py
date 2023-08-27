from flask import Flask
from flask_cors import CORS
from flask import request, send_file, redirect, url_for

from pathlib import Path

import json

from processor import process_video, get_video_by_filename

app = Flask(__name__)

CORS(app, origins=["http://localhost:3000"])

app.config["UPLOAD_EXTENSIONS"] = [".mp4", ".jpg", ".png", "webm"]

FILE = Path(__file__).resolve()
ROOT = FILE.parents[0]

def fail_with(msg):
    return {
        "status": "failed",
        "message": msg,
    }

@app.route("/process_youtube_link", methods=["POST"])
def process_youtube_link():
    decoded = request.data.decode('utf-8')
    request_json = json.loads(decoded)
    video_link = request_json["videoLink"]

    # Extract transcript
    # Extract OCR results per frame
    # Group OCR results based on similarity
    # Map transcript to OCR
    # moment: {
    #   "start": 0,
    #   "finish": 0,
    #   "transcriptStart": 0,
    #   "transcriptFinish": 0,
    #   "title": "text caption",
    # }

    # result = {
    #   "moments": list[moments]
    #   "transcript": list[transcript]
    # }

    transcript, moments, metadata = process_video(video_link)
    filename = f'{metadata["id"]}.mp4'

    responseJSON = {
        "request": {
            "videoLink": video_link,
        },
        "moments": moments,
        "metadata": metadata,
        "transcript": transcript,
        #"source": url_for("display_video", filename=filename),
        "source": str(get_video_by_filename(filename)),
        "status": "success"
    }
    return json.dumps(responseJSON)

@app.route('/display_video/<filename>', methods=["GET"])
def display_video(filename):
    video_path = get_video_by_filename(filename)
    print(filename, video_path)
    return redirect(video_path, code=301)

def test_video(video_link):
    transcript, moments, metadata = process_video(video_link)
    print(transcript)
    #print(transcript)
    #print(moments)


def launch_server():
    app.run(host="0.0.0.0", port=7777)

if __name__ == "__main__":
    #test_video("https://www.youtube.com/live/4LdIvyfzoGY?feature=share")
    #test_video("https://youtu.be/XqdDMNExvA0")
    #test_video("https://youtu.be/pZ3HQaGs3uc")
    launch_server()