import { action } from "mobx";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

import "./App.css";
import EditorCanvas from "./views/EditorCanvas";
import Timeline from "./views/Timeline";

import useRootContext from "./hooks/useRootContext";
import { DUMMY_VIDEO_LINKS } from "./data/dummy";
import VideoState from "./stores/videoState";
import Script from "./views/Script";
import CommandSpace from "./views/CommandSpace";

const App = observer(function App() {
    const { uiStore, domainStore } = useRootContext();

    useEffect(
        action(() => {
            uiStore.setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }),
        [window.innerWidth, window.innerHeight]
    );

    useEffect(
        action(() => {
            const newVideos = [];
			for (let link of DUMMY_VIDEO_LINKS) {
				const video = new VideoState(
                    domainStore,
                    link,
                    `${"video"}-${newVideos.length + 10}`,
                    newVideos.length,
                );
				newVideos.push(video);
			}
            // for (let segment of DUMMY_SEGMENTS) {
            //     const video = new VideoState(
            //         domainStore,
            //         "http://localhost:3000/output.webm",
            //         `${"video"}-${newVideos.length + 10}`,
            //         0
            //     );
            //     video.commonState.setMetadata({
            //         thumbnails: [
            //             segment?.lowLabel ? segment.lowLabel : "misc",
            //             segment?.highLabel ? segment.highLabel : "None",
            //         ],
            //         offset: segment.start,
            //         start: segment.start,
            //         finish: segment.finish,
            //     });
            //     video.highLabel = segment?.highLabel ? segment.highLabel : "None";
            //     video.lowLabel = segment?.lowLabel ? segment.lowLabel : "misc";
            //     video.setTranscript([
            //         {
            //             text: segment.text,
            //             start: segment.start,
            //             finish: segment.finish,
            //             lowLabel: video.lowLabel,
            //             highLabel: video.highLabel,
            //         },
            //     ]);
            //     newVideos.push(video);
            // }
			domainStore.projectMetadata.trackCnt = newVideos.length;
            domainStore.videos = [...newVideos];
        }),
        [DUMMY_VIDEO_LINKS]
    );

    return (
        <div className="App">
			<CommandSpace />
            <div className="grid grid-cols-2 grid-rows-2">
                <div className="col-span-1 row-span-1">
                    <Script />
                </div>
                <div className="col-span-1 row-span-1">
                    <EditorCanvas />
                </div>
                <div className="col-span-2 row-span-1">
                    <Timeline />
                </div>
            </div>
        </div>
    );
});

export default App;
