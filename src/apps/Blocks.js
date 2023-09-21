import { action } from "mobx";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

import "../App.css";
import EditorCanvas from "../views/EditorCanvas";
import Timeline from "../views/Timeline";

import useRootContext from "../hooks/useRootContext";
// import { DUMMY_VIDEO_LINKS } from "./data/dummy";

// import VideoState from "./stores/objects/videoState";

import TextWall from "../views/TextWall";
import CommandSpace from "../views/CommandSpace";
import EditPanel from "../views/EditPanel";
import Header from "../views/Header";
import SideHistory from "../views/SideHistory";
import NavigationToggle from "../components/general/NavigationToggle";
import Explanation from "../components/general/Explanation";

const Blocks = observer(function Blocks() {
    const { userStore, uiStore, domainStore } = useRootContext();

	const chooseTask = action((taskIdx) => {
		userStore.chooseTask(taskIdx);
	});

	const chooseTutorial = action(() => {
		userStore.chooseTutorial();
	});

	const chooseFsTask = action((taskIdx) => {
		userStore.chooseFsTask(taskIdx);
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

    return (
	<div className="h-screen"> 
		{
			userStore.loading ? (
				<div> LOADING ... </div>
			) : (<div className="flex flex-col h-screen">
				<Header />
				{
					userStore.isTaskChosen ? (
						<div className="flex flex-row h-full">
							<div className="relative w-1/12 h-full">
								<SideHistory />
							</div>	
							<div className="flex flex-col w-11/12 h-full">
								<div className="flex flex-row w-full h-fit">
									<div className="flex flex-col w-1/2 p-1 m-1 border-2">
										<CommandSpace />
										<Explanation />
									</div>
									<div className="flex flex-col w-1/2 p-1 m-1 border-2">
										<EditorCanvas />
									</div>
								</div>
								<div className="flex flex-row w-full border-2 m-1">

									<div className="flex flex-col w-1/2 p-1">
										<EditPanel />
									</div>
									<div className="flex flex-col w-1/2 p-1">
										<Timeline />
										<TextWall />	
									</div>
								</div>
							</div>
						</div>
					) : (
						<div className="flex flex-start gap-2 m-2">
							<button
								className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
								onClick={() => chooseFsTask(2)}
							>
								FS Task 2
							</button>
							<button
								className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
								onClick={() => chooseFsTask(3)}
							>
								FS Task 3
							</button>
							<button
								className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
								onClick={() => chooseFsTask(4)}
							>
								FS Task 4
							</button>
							<button
								className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
								onClick={() => chooseFsTask(5)}
							>
								FS Task 5
							</button>
							<button
								className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
								onClick={() => chooseFsTask(6)}
							>
								FS Task 6
							</button>
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
					)
				}
			</div>
			)
		} 
	</div>);
});

export default Blocks;
