import os, re

from flask import Response

import ffmpeg

def get_chunk(video_path, byte1=None, byte2=None):
    file_size = os.stat(video_path).st_size
    start = 0
    
    if byte1 < file_size:
        start = byte1
    if byte2:
        length = byte2 + 1 - byte1
    else:
        length = file_size - start

    with open(video_path, 'rb') as f:
        f.seek(start)
        chunk = f.read(length)
    return chunk, start, length, file_size

def get_video_file(video_path, range_header):
    print(video_path, range_header)
    byte1, byte2 = 0, None
    if range_header:
        match = re.search(r'(\d+)-(\d*)', range_header)
        groups = match.groups()

        if groups[0]:
            byte1 = int(groups[0])
        if groups[1]:
            byte2 = int(groups[1])

    print(byte1, byte2) 

    chunk, start, length, file_size = get_chunk(video_path, byte1, byte2)
    response = Response(chunk, 206,
                      content_type='video/mp4', direct_passthrough=True)
    response.headers.add(
        'Content-Range',
        'bytes {0}-{1}/{2}'.format(start, start + length - 1, file_size)
        )
    return response

#ffmpeg -i input.avi -c:v libx264 -preset slow -crf 20 -c:a aac -b:a 160k -vf format=yuv420p -movflags +faststart output.mp4

def convert_mp4_to_mp4h264(video_path, video_id):
    new_video_path = video_path + ".mp4"
    video_id = video_id + ".mp4"
    (
        ffmpeg
        .input(video_path)
        .output(new_video_path, **{
            'c:v': "libx264",
            #'preset': "slow",
            #'crf': "20",
            'c:a': "aac",
            'b:a': "160k",
            #'vf': "format=yuv420p",
            #'movflags': "+faststart",
        })
        .run()
    )
    os.remove(video_path)
    return new_video_path, video_id

if __name__ == "__main__":
    print(convert_mp4_to_mp4h264("clips/slime.mp4", "lol"))
