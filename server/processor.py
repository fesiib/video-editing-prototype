import cv2
import json
import webvtt


from yt_dlp import YoutubeDL

from pathlib import Path

ROOT = Path('.')
DATABASE = ROOT / "static" / "database"

video_library = {}

def get_video_by_filename(filename):
    return DATABASE / filename

def download_video(video_link):
    options = {
        "paths": {
            "home": str(DATABASE)
        },
        "outtmpl": {
            "default": "%(id)s.%(ext)s"
        },
        "writesubtitles": True,
        "writeautomaticsub": True,
        "format": "mp4[height<=480]",
        "subtitleslangs": {"en"},
        "subtitlesformat": "/vtt/g",
    }

    with YoutubeDL(options) as ydl:
        info = ydl.extract_info(video_link, download=True)
        metadata = ydl.sanitize_info(info)
        return metadata
        

def get_transcript(subtitles):
    transcript = []
    for caption in subtitles:
        lines = caption.text.strip("\n ").split("\n")
        if len(transcript) == 0:
            transcript.append({
                "start": caption.start,
                "finish": caption.end,
                "text": "\n".join(lines),
            })
            continue
        last_caption = transcript[len(transcript) - 1]

        new_text = ""
        for line in lines:
            if line.startswith(last_caption["text"], 0):
                new_line = line[len(last_caption["text"]):-1].strip()
                if len(new_line) > 0:
                    new_text += new_line + "\n"
            elif len(line) > 0:
                new_text += line + "\n"
        new_text = new_text.strip("\n ")
        if len(new_text) == 0:
            transcript[len(transcript) - 1]["finish"] = caption.end
        else:
            transcript.append({
                "start": caption.start,
                "finish": caption.end,
                "text": new_text,
            })
    return transcript

def get_moments(stream):
    while (True):
        res, frame = stream.read()
        if (res == False):
            break
    
    return [{
        "start": 1,
        "finish": 5,
        "transcriptStart": 0,
        "transcriptFinish": 1,
        "type": "text caption",
    }]

def process_video(video_link):
    if (video_link not in video_library):
        video_library[video_link] = download_video(video_link)
    
    metadata = video_library[video_link]

    video_path = metadata["requested_downloads"][0]["filepath"]
    subtitles_path = metadata["requested_subtitles"]["en"]["filepath"]
    
    transcript = []
    moments = []

    video_cap = cv2.VideoCapture(video_path)
    moments = get_moments(video_cap)
    video_cap.release()
    
    subtitles = webvtt.read(subtitles_path)
    transcript = get_transcript(subtitles)

    return transcript, moments, metadata