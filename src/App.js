import { action } from "mobx";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

import "./App.css";
import EditorCanvas from "./views/EditorCanvas";
import Timeline from "./views/Timeline";

import useRootContext from "./hooks/useRootContext";
// import { DUMMY_VIDEO_LINKS } from "./data/dummy";

// import VideoState from "./stores/objects/videoState";

import TextWall from "./views/TextWall";
import CommandSpace from "./views/CommandSpace";
import EditPanel from "./views/EditPanel";
import Header from "./views/Header";

const App = observer(function App() {
    const { userStore, uiStore, domainStore } = useRootContext();

	const chooseTask = action((taskIdx) => {
		userStore.chooseTask(taskIdx);
	});

	const chooseTutorial = action(() => {
		userStore.chooseTutorial();
	});

    useEffect(
        action(() => {
            uiStore.setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }),
        [window.innerWidth, window.innerHeight]
    );

    // useEffect(
    //     action(() => {
	// 		domainStore.in_mainVideos = [
	// 			new VideoState(
	// 				domainStore,
	// 				domainStore.in_mainVideos,
	// 				DUMMY_VIDEO_LINKS[0],
	// 				0,
	// 				true,
	// 			), 
	// 		];
	// 		domainStore.projectMetadata.trackCnt = 1;
    //     }),
    //     [JSON.stringify(DUMMY_VIDEO_LINKS)]
    // );

    return (
        <div className="App">
			<div>
				<Header />
			</div>
			{
				userStore.isLoggedIn ? (userStore.isTaskChosen ? (
					<div className="grid grid-cols-7 grid-rows-4">
						<div className="col-span-1 row-span-4 flex flex-col">
							<EditPanel />
						</div>
						<div className="col-span-3 row-span-2">
							<EditorCanvas />
							<Timeline />
						</div>
						<div className="col-span-3 row-span-2 ml-10">
							<TextWall />
						</div>
						<div className="col-span-6 row-span-2">
							<CommandSpace />
						</div>
					</div>
				) : (
					<div className="flex flex-start gap-2 m-2">
						<button
							className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
							onClick={() => chooseTutorial()}
						>
							Tutorial
						</button>
						<button
							className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
							onClick={() => chooseTask(0)}
						>
							Task 1
						</button>
						<button
							className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
							onClick={() => chooseTask(1)}
						>
							Task 2
						</button>
						<button
							className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
							onClick={() => chooseTask(2)}
						>
							Task 3
						</button>
						<button
							className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
							onClick={() => chooseTask(3)}
						>
							Task 4
						</button>
					</div>
				)) : null
			}
        </div>
    );
});

export default App;
