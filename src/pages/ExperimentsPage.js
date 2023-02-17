import React, { useRef, useState } from "react";

import videojs from "video.js";
import 'video.js/dist/video-js.css';

import { colorPalette } from "../colors";

import Script from "../components/Script";
import VideoPlayer from "../components/VideoPlayer";

import { labelInfo } from "../labelInfo";

import { getVideoUrlFromVideoId, uploadVideoToServer } from "../services/EditorAPI";

function ExperimentsPage() {
    const [video, setVideo] = useState (null);


    const [ videoId, setVideoId ] = useState(null);
    const [ videoTime, setVideoTime ] = useState(0);


    const [script, setScript] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState (-1);
    
    const [selectedLabels, setSelectedLabels] = useState (["opening", "goal", "motivation", "briefing", "subgoal", "instruction", "tool", "justification", "effect", "tip", "warning", "status", "context", "tool-spec", "closing", "outcome", "reflection", "side-note", "self-promo", "bridge", "filler"]);
    const [filteredScript, setFilteredScript] = useState ([]);

    const [initialTimeInfo, setInitialTimeInfo] = useState (null);

    const [uploadFile, setUploadFile] = useState(null);

    const playerRef = useRef(null);

    const showLabelInfo = (label) => {
        const trueLabel = labelInfo[label];
        const target = document.getElementById(trueLabel);
        target.style.visibility = "visible";
        target.parentElement.style.boxShadow = "0 0 25px rgb(34, 58, 164), 0 0 5px rgb(124, 144, 255)";
    };
    
    const hideLabelInfo = (label) => {
        const trueLabel = labelInfo[label];
        const target = document.getElementById(trueLabel);
        target.style.visibility = "";
        target.parentElement.style.boxShadow = "";
    };

    const uploadChangeHandler = (event) => {
        console.log("Upload File Changed?");
        setUploadFile(event.target.files[0]);
    }

    const uploadSubmitHandler = (event) => {
        event.preventDefault();
        if (uploadFile === null) {
            console.log("Upload File Doesn't Exists");
            return;
        }
        console.log("Upload File Exists");
        uploadVideoToServer(uploadFile).then((response) => {
            console.log(response);
            setVideoId(response['video_id']);
            setUploadFile(null);
        });
    }

    console.log(getVideoUrlFromVideoId(videoId));

    const playerOptions = {
        autoplay: false,
        controls: true,
        responsive: true,
        fluid: true,
        sources: [{
            src: getVideoUrlFromVideoId(videoId),
            //src: "http://localhost:7777/video/slime.mp4.mp4",
        }]
    }

    const handlePlayerReady = (player) => {
        playerRef.current = player;

        player.on('waiting', () => {
            videojs.log('player waiting');
        });
        player.on('dispose', () => {
            videojs.log('player will dispose');
        });
    }

    return <div>
        <h1> Experiments </h1> 
        <div>
            <form onSubmit={uploadSubmitHandler}>
                <h3> Upload the mp4 video </h3>
                <input type={'file'} onChange={uploadChangeHandler} accept={".mp4,.webm"}/>
                <button type={'submit'}> Upload </button>
            </form>
        </div>
        <div>
            <VideoPlayer options={playerOptions} onReady={handlePlayerReady}/>
        </div>
        <div className='script_wrapper'>
          <Script 
            script={script}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            video={video}
            videoTime={videoTime}
            setVideoTime={setVideoTime}
            colorPalette={colorPalette}
            //logData={logData}
            initialTimeInfo={initialTimeInfo}
            filteredScript={filteredScript}
            showLabelInfo={showLabelInfo}
            hideLabelInfo={hideLabelInfo}
          />
        </div>
    </div>
}

export default ExperimentsPage;