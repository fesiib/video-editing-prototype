import { action } from "mobx";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

import "./App.css";
import EditorCanvas from "./views/EditorCanvas";
import Timeline from "./views/Timeline";

import useRootContext from "./hooks/useRootContext";
import { DUMMY_SEGMENTS } from "./data/dummy";
import VideoState from "./stores/videoState";
import Script from "./views/Script";

const App = observer(function App() {
    const { uiStore, domainStore }= useRootContext();

    useEffect(
        action(() => {
            uiStore.setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }),
        [window.innerWidth, window.innerHeight]
    );

	useEffect(action(() => {
		const newVideos = [
			//new VideoState(this, "http://localhost:3000/demo-3.webm", "video-1", 0),
		];
		// for (let segment of DUMMY_SEGMENTS) {
		// 	const title = segment.title;
		// 	for (let subsegment in segment) {
		// 		if (subsegment === 'title') {
		// 			continue;
		// 		}
		// 		const info = segment[subsegment];
		// 		const video = 
		// 			new VideoState(
		// 				domainStore,
		// 				"http://localhost:3000/example.mp4",
		// 				`${"video"}-${newVideos.length + 10}`,
		// 				0
		// 			);
		// 		video.commonState.setMetadata({
		// 			thumbnails: [subsegment],
		// 			offset: info.start,
		// 			start: info.start,
		// 			finish: info.finish,
		// 		});
		// 		video.setScript([{
		// 			text: info.script,
		// 			start: info.start,
		// 			lowLabel: subsegment,
		// 			highLabel: title,
		// 		}]);
		// 		newVideos.push(video);
		// 	}
		// }
		for (let segment of DUMMY_SEGMENTS) {
			const video = 
				new VideoState(
					domainStore,
					"http://localhost:3000/example.mp4",
					`${"video"}-${newVideos.length + 10}`,
					0
				);
			video.commonState.setMetadata({
				thumbnails: [
					(segment?.lowLabel ? segment.lowLabel : "misc"),
					(segment?.highLabel ? segment.highLabel : "None")
				],
				offset: segment.start,
				start: segment.start,
				finish: segment.finish,
			});
			video.highLabel = segment?.highLabel ? segment.highLabel : "None";
			video.lowLabel = segment?.lowLabel ? segment.lowLabel : "misc";
			video.setScript([{
				text: segment.text,
				start: segment.start,
				finish: segment.finish,
				lowLabel: segment.lowLabel,
				highLabel: segment.highLabel,
			}]);
			newVideos.push(video);
		}
		domainStore.videos = [...newVideos];
	}), [DUMMY_SEGMENTS]);

    return (
        <div className="App">
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
