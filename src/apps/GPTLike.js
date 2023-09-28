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

const GPTLike = observer(function GPTLike() {
	const DISPLAY_STR = "Whenever there is laptop seen, highlight it with a transparent star around it";
    const { userStore, uiStore, domainStore } = useRootContext();

	const chooseTask = action((taskIdx) => {
		userStore.chooseTask(taskIdx);
		uiStore.logData("taskSelect", null);
	});

	const chooseTutorial = action((idx) => {
		userStore.chooseTutorial(idx);
		uiStore.logData("taskSelectTutorial", {
			tutorialType: userStore.videoId,
		});
	});

	// const chooseFsTask = action((taskIdx) => {
	// 	userStore.chooseFsTask(taskIdx);
	// });

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
	<div className="h-screen"> 
		{
			userStore.loading ? (
				<div> LOADING ... </div>
			) : (<div className="flex flex-col h-screen">
				<Header />
				{
					userStore.isTaskChosen ? (
						// <div className="grid grid-cols-7 grid-rows-4 h-full overflow-hidden">
						// 	<div className="col-span-full row-span-3 grid grid-cols-7 gap-4"> 
						// 		<div className="col-span-1">
						// 			<EditPanel />
						// 		</div>
						// 		<div className="col-span-3 flex flex-col items-center">
						// 			<EditorCanvas />
						// 			<Timeline />
						// 		</div>
						// 		<div className="col-span-3">
						// 			<TextWall />
						// 		</div>
						// 	</div>
						// 	<div className="col-span-6 col-start-2 place-content-around mx-5 justify-around object-top">
						// 		<CommandSpace />
						// 	</div>
						// </div>
						// <div className="grid grid-cols-7 h-full">
						// 	<div className="col-span-1">
						// 		<EditPanel />
						// 	</div>
						// 	<div className="col-span-6 flex flex-col justify-start  mx-8">
						// 		<div className="grid grid-cols-2 items-center gap-2">
						// 			<div className="col-span-1 row-span-full flex flex-col items-center">
						// 				<EditorCanvas />
						// 				<Timeline />
						// 			</div>
						// 			<div className="col-span-1 row-span-full mx-4">
						// 				<TextWall />
						// 			</div>
						// 		</div>
						// 		<div className="col-span-6 col-start-2">
						// 			<CommandSpace />
						// 		</div>
						// 	</div>
						// </div>
						<div className="flex flex-row h-full">
							<div className="relative w-1/12 h-full">
								<SideHistory />
							</div>	
							<div className="flex flex-col w-5/12 mx-1 gap-2">
								<div className="flex flex-col m-1 p-1 drop-shadow-lg gap-2">
									<CommandSpace />
									<Explanation />
								</div>
								<EditPanel />
							</div>
							{/* <div className="flex flex-col w-6/12 items-center">
								<EditorCanvas />
								<NavigationToggle />
								<Timeline />
								{
									uiStore.navigation === "transcript" ? (
										<TextWall />
									) : null
								}
							</div> */}
							<div className="flex flex-col w-6/12 items-center">
								<EditorCanvas />
								<Timeline />
								<TextWall />
							</div>
						</div>
					) : (
						<div className="flex flex-start gap-2 m-2">
							{/* <button
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
							</button> */}
							<button
								className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
								onClick={() => chooseTutorial(0)}
							>
								Tutorial T
							</button>
							<button
								className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
								onClick={() => chooseTutorial(1)}
							>
								Tutorial B
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
							{/* <button
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
							</button> */}
						</div>
					)
				}
				{/* <div className="flex flex-row gap-1 divide-x divide-solid flex-wrap">
					{
						Array(...DISPLAY_STR).map((char, idx) => {
							return (
								<div key={idx} className="m-1 flex flex-col">
									<span>
										{idx}
									</span>
									<span>
										{char}
									</span>	
								</div>
							);
						})
					}
				</div>  */}
			</div>
			)
		}
	</div>);
});

export default GPTLike;
