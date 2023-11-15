import React, { useEffect, useRef, useState } from "react";

import { observer } from "mobx-react-lite";
import { action, set, toJS } from "mobx";

import { AiOutlineSend } from "react-icons/ai";

import useRootContext from "../hooks/useRootContext";
import SketchCanvas from "../components/command-space/SketchCanvas";

import { IconContext } from "react-icons";


const CommandWindow = observer(function CommandWindow() {
	const { userStore, uiStore, domainStore } = useRootContext();
	const systemSetting = userStore.systemSetting;
	
	const curTab = domainStore.tabs[domainStore.curTabPos];

	const textCommandLimit = 200;
	const textCommandRef = useRef(null);

	const [shouldSketch, setShouldSketch] = useState(false);

	const onChangeTextCommand = action((event) => {
		const text = event.target.value;
		curTab.setTextCommand(text);
		uiStore.logData("commandspaceTextChange", {
			text: text,
		});
	});

	const onProcessClick = action(() => {
		domainStore.processRequest(
			domainStore.processingModes.fromScratch,
			{
				start: 0,
				finish: domainStore.projectMetadata.duration,
			}
		);
		uiStore.logData("commandspaceProcess", {
			text: curTab.textCommand,
			sketch: toJS(curTab.sketchCommand),
			sketchTimestamp: curTab.sketchPlayPosition,
			mode: domainStore.processingModes.fromScratch,
			start: 0,
			finish: domainStore.projectMetadata.duration,
		});
	});

	const onKeyDown = action((event) => {
		if (event.key === "Enter") {
			onProcessClick();
		}
	});

	const onProcessingMode = action((event) => {
		curTab.setProcessingMode(event.target.value);
	});

	const onSketchTextClick = action(() => {
		uiStore.canvasControls.sketching = true;
	});

	useEffect(action(() => {
		const text = curTab.textCommand;
		const words = text.trim().match(/\S+/g);
		if (textCommandRef.current === null) {
			setShouldSketch(() => false);
			return;
		}
		if (words === null
			|| words.length < 2
		) {
			setShouldSketch(() => false);
			return;
		}
		setShouldSketch(() => true);
	}), [curTab.textCommand]);

	return (<IconContext.Provider value={{ 
		color: "black", 
		className: "",
		size: "1.5em",
	}}>
		<div className="w-full flex flex-col items-center">
			<div className="w-full flex flex-row gap-2 items-center"> 
				<span>
					<span className="text-s">
						{`Tab ${curTab.idx}`}
					</span>
					<span className="font-bold">
						{` ${curTab.title}`}
					</span>
				</span>
			</div>
			{systemSetting ? (
				<div className="w-full p-1 bg-gray-100">
					<div className="flex flex-row w-full gap-2"> 
						<div className="flex flex-col w-full gap-1 border p-1">
							<textarea 
								id="textCommand" 
								maxLength={textCommandLimit}
								type="text"
								rows="4"
								placeholder="Ex) Whenever laptop is mentioned, put a white text with transparent background."
								value={curTab.textCommand}
								className="w-full resize-none relative z-10"
								style={{
									margin: 0,
									borderRadius: 0,
									color: "#444444",
									backgroundColor: "transparent",
								}}
								onChange={onChangeTextCommand}
								onKeyDown={onKeyDown}
							/>
							<div className="flex flex-row justify-between">
								<SketchCanvas 
									shouldSketch={shouldSketch}
								/>
								<span
									className="text-xs"
								> {curTab.textCommand.length}/{textCommandLimit}</span>
							</div>
						</div>
						<div className="flex flex-col gap-1 justify-end items-end">
							{/* <div className="flex flex-col">

								<label htmlFor="processingMode"
									className="w-full"
								> Mode: </label>
								<select id={"processingMode"} value={curTab.processingMode} onChange={onProcessingMode}
									className="p-1"
								>
									<option value={domainStore.processingModes.fromScratch}> From scratch </option>
									<option value={domainStore.processingModes.addMore}> Add more </option>
									<option value={domainStore.processingModes.adjustSelected}> Adjust existing </option>
								</select>
							</div> */}
							<button 
								className={"w-fit h-fit bg-indigo-200 text-black p-1 rounded hover:bg-indigo-300"
									+ " disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-200"
								}

								onClick={() => onProcessClick()}
								disabled={curTab.processingAllowed === false}
							>
								<AiOutlineSend />
							</button>
						</div>
					</div>
				</div>
			) : null}
		</div>
	</IconContext.Provider>);
});

export default CommandWindow;