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
import TextWall from "./views/TextWall";
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
			domainStore.in_mainVideos = [new VideoState(
				domainStore,
				DUMMY_VIDEO_LINKS[0],
				`${"video"}`,
				0,
				true,
			)];
			domainStore.projectMetadata.trackCnt = 1;
        }),
        [DUMMY_VIDEO_LINKS]
    );

    return (
        <div className="App">
            <div className="grid grid-cols-2 grid-rows-2">
                <div className="col-span-1 row-span-1">
                    <TextWall />
                </div>
                <div className="col-span-1 row-span-1">
                    <EditorCanvas />
                </div>
                <div className="col-span-2 row-span-1">
                    <Timeline />
					<CommandSpace />
                </div>
            </div>
        </div>
    );
});

export default App;
