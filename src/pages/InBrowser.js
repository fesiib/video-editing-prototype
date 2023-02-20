import React, { useState } from 'react';

import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

import * as helpers from "../services/helpers"
import VideoFilePicker from '../components/VideoFilePicker';
import OutputVideo from '../components/OutputVideo';
import RangeInput from '../components/RangeInput';

const FF = createFFmpeg({
    log: true,
    //corePath: "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js",
});

(async function () {
    await FF.load();
})();

function InBrowser() {
    const [inputVideoFile, setInputVideoFile] = useState(null);
    const [trimmedVideoFile, setTrimmedVideoFile] = useState(null);
    const [trimIsProcessing, setTrimIsProcessing] = useState(false);
    const [videoMeta, setVideoMeta] = useState(null);
    const [URL, setURL] = useState(null);
    const [rStart, setRstart] = useState(0); // 0%
    const [rEnd, setRend] = useState(10); // 10%


    const [thumbnails, setThumbnails] = useState([]);
    const [thumbnailIsProcessing, setThumbnailIsProcessing] = useState(false);

    const handleChange = async (e) => {
      let file = e.target.files[0];
      console.log(file);
      setInputVideoFile(file);
      setURL(await helpers.readFileAsBase64(file));
    };

    const handleUpdateRange = (func) => {
      return ({ target: { value } }) => {
      func(value);
      };
    };

    const getThumbnails = async ({ duration }) => {
      if (!FF.isLoaded()) await FF.load();
      setThumbnailIsProcessing(true);
      let MAX_NUMBER_OF_IMAGES = 15;
      let NUMBER_OF_IMAGES = 15;
      let offset =
        duration === MAX_NUMBER_OF_IMAGES ? 1 : duration / NUMBER_OF_IMAGES;
      NUMBER_OF_IMAGES = duration < MAX_NUMBER_OF_IMAGES ? duration : 15;
      FF.FS("writeFile", inputVideoFile.name, await fetchFile(inputVideoFile));
      const arrayOfImageURIs = [];
      for (let i = 0; i < NUMBER_OF_IMAGES; i++) {
        let startTimeInSecs = helpers.toTimeString(Math.round(i * offset));
        if (startTimeInSecs + offset > duration && offset > 1) {
          offset = 0;
        }
        try {
          await FF.run(
            "-ss",
            startTimeInSecs,
            "-i",
            inputVideoFile.name,
            "-t",
            "00:00:1.000",
            "-vf",
            `scale=150:-1`,
            `img${i}.png`
          );
          const data = FF.FS("readFile", `img${i}.png`);
          let blob = new Blob([data.buffer], { type: "image/png" });
          let dataURI = await helpers.readFileAsBase64(blob);
          arrayOfImageURIs.push(dataURI);
          FF.FS("unlink", `img${i}.png`);
        } catch (error) {
          console.log({ message: error });
        }
      }
      setThumbnailIsProcessing(false);
      return arrayOfImageURIs;
    };
  
    const handleLoadedData = async (e) => {
      const el = e.target;
      const meta = {
        name: inputVideoFile.name,
        duration: el.duration,
        videoWidth: el.videoWidth,
        videoHeight: el.videoHeight,
      };
      console.log({ meta });
      setVideoMeta(meta);

      const thumbNails = await getThumbnails(meta);
      setThumbnails(thumbNails);
    };
  
    const handleTrim = async () => {
      setTrimIsProcessing(true);
      let startTime = ((rStart / 100) * videoMeta.duration).toFixed(2);
      let offset = ((rEnd / 100) * videoMeta.duration - startTime).toFixed(2);
      try {
        FF.FS("writeFile", inputVideoFile.name, await fetchFile(inputVideoFile));
        await FF.run(
          "-ss",
          helpers.toTimeString(startTime),
          "-i",
          inputVideoFile.name,
          "-t",
          helpers.toTimeString(offset),
          "-c:v",
          "copy",
          "ping.mp4"
        );
        const data = FF.FS("readFile", "ping.mp4");
        console.log(data);
        const dataURL = await helpers.readFileAsBase64(
          new Blob([data.buffer], { type: "video/mp4" })
        );
        setTrimmedVideoFile(dataURL);
      } catch (error) {
        console.log(error);
      } finally {
        setTrimIsProcessing(false);
      }
    };
  
    return (
      <main className="App">
        {
        <>
          <RangeInput
            rEnd={rEnd}
            rStart={rStart}
            handleUpdaterStart={handleUpdateRange(setRstart)}
            handleUpdaterEnd={handleUpdateRange(setRend)}
            loading={thumbnailIsProcessing}
            videoMeta={videoMeta}
            control={
              <div className="u-center">
                <button
                  onClick={handleTrim}
                  className="btn btn_b"
                  disabled={trimIsProcessing}
                >
                  {trimIsProcessing ? "trimming..." : "trim selected"}
                </button>
              </div>
            }
            thumbNails={thumbnails}
          />
        </>
        }
        {/* <div className="u-center">
          <button
            onClick={handleTrim}
            className="btn btn_b"
            disabled={trimIsProcessing}
          >
            {trimIsProcessing ? "trimming..." : "trim selected"}
          </button>
        </div> */}
        <section className="deck">
          <article className="grid_txt_2">
            <VideoFilePicker
              handleChange={handleChange}
              showVideo={!!inputVideoFile}
            >
              <div className="bord_g_2 p_2">
                <video
                  src={inputVideoFile ? URL : null}
                  autoPlay
                  controls
                  muted
                  onLoadedMetadata={handleLoadedData}
                  width="450"
                ></video>
              </div>
            </VideoFilePicker>
          </article>
          <OutputVideo
            videoSrc={trimmedVideoFile}
            handleDownload={() => helpers.download(trimmedVideoFile)}
          />
        </section>
      </main>
    );
  }

function InBrowser2() {
  const [videoSrc, setVideoSrc] = useState('');
  const [message, setMessage] = useState('Click Start to transcode');
  const ffmpeg = createFFmpeg({
    //corePath: "./node_modules/@ffmpeg/core/dist/ffmpeg-core.js",
    log: true,
  });
  const doTranscode = async () => {
    setMessage('Loading ffmpeg-core.js');
    await ffmpeg.load();
    setMessage('Start transcoding');
    ffmpeg.FS('writeFile', 'test.avi', await fetchFile('http://localhost:3000/flame.avi'));
    await ffmpeg.run('-i', 'test.avi', 'test.mp4');
    setMessage('Complete transcoding');
    const data = ffmpeg.FS('readFile', 'test.mp4');
    setVideoSrc(URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' })));
  };
  return (
    <div className="App">
      <p/>
      <video src={videoSrc} controls></video><br/>
      <button onClick={doTranscode}>Start</button>
      <p>{message}</p>
    </div>
  );
}

export default InBrowser;