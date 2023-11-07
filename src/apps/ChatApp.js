import { action } from "mobx";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

import "../App.css";
import EditorCanvas from "../views/EditorCanvas";
import Timeline from "../views/Timeline";

import useRootContext from "../hooks/useRootContext";

import TextWall from "../views/TextWall";
//import CommandSpace from "../views/CommandSpace";
import EditPanel from "../views/EditPanel";
import Header from "../views/Header";
//import SideHistory from "../views/SideHistory";
import NavigationToggle from "../components/general/NavigationToggle";
//import Explanation from "../components/general/Explanation";
import ChatWindow from "../views/ChatWindow";
import CommandWindow from "../views/CommandWindow";
import TabsWindow from "../views/TabsWindow";

const ChatApp = observer(function ChatApp() {
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
							<div className="flex flex-col w-6/12 items-center">
								<EditorCanvas />
								<Timeline />
								{
									uiStore.navigation === "transcript" ? (
										<TextWall />
									) : <EditPanel />
								}
								<NavigationToggle />
							</div>

							<div className="flex flex-col w-6/12 items-center">
								<CommandWindow />
								<ChatWindow />
								<TabsWindow />
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
								onClick={() => chooseTutorial(0)}
							>
								Tutorial T
							</button>
							{/* <button
								className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
								onClick={() => chooseTutorial(1)}
							>
								Tutorial B
							</button> */}
							<button
								className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
								onClick={() => chooseTask(0)}
							>
								Task
							</button>
							{/* <button
								className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
								onClick={() => chooseTask(1)}
							>
								Task 2
							</button> */}
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

export default ChatApp;
