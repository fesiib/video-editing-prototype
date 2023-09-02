import React, { useState } from "react";

import { observer } from "mobx-react-lite";
import { action } from "mobx";

import useRootContext from "../hooks/useRootContext";
import SketchCanvas from "../components/command-space/SketchCanvas";

const fromScratch = "from-scratch";
const addMore = "add-more";
const adjustSelected = "adjust-selected";

const CommandSpace = observer(function CommandSpace() {
	const { userStore, domainStore } = useRootContext();
	const systemSetting = userStore.systemSetting;
	const curIntent = domainStore.intents[domainStore.curIntentPos];
	const reversedIntents = [...domainStore.intents].reverse();

	const [processMode, setProcessMode] = useState(fromScratch);

	const onChangeTextCommand = (event) => {
		curIntent.setTextCommand(event.target.value);
	}

	const onProcessClick = action(() => {
		domainStore.processIntent();
	});

	const onConsiderEditsClick = action(() => {
		curIntent.considerEdits = !curIntent.considerEdits;
	});

	const onProcessModeChange = action((event) => {
		setProcessMode(event.target.value);
	});

	return (<div className="w-full flex flex-col items-center">
		<h2 className="w-full"> Describe your edit </h2>
		{systemSetting ? (
			domainStore.processingIntent ? (
				<div> Processing... </div>
			) : (
				<div className="flex flex-row w-full gap-2 p-1 bg-gray-100"> 
					<div className="flex flex-col w-full gap-1 border p-1">
						<textarea 
							id="textCommand" 
							maxLength={100}
							type="text"
							rows="4"
							placeholder="description"
							value={curIntent.textCommand}
							className="w-full border p-1 resize-none"
							onChange={onChangeTextCommand} 
						/>
						<div className="flex flex-row justify-between">
							<SketchCanvas />
							<span
								className="text-xs"
							> {curIntent.textCommand.length}/{100}</span>
						</div>
					</div>
					<div className="flex flex-col gap-1 justify-end items-end">
						<div className="flex flex-col">

							<label htmlFor="processMode"
								className="w-full"
							> Mode: </label>
							<select id={"processMode"} value={processMode} onChange={onProcessModeChange}
								className="p-1"
							>
								<option value={fromScratch}> From scratch </option>
								<option value={addMore}> Add more </option>
								<option value={adjustSelected}> Adjust selected </option>
							</select>
						</div>
						<button 
							className="w-fit h-fit bg-indigo-300 text-black py-2 px-2 rounded hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
							onClick={() => onProcessClick()}
							disabled={curIntent.textCommand === ""}
						>
							Submit
						</button>
					</div>
				</div>
			)
		) : null}
	</div>);
});

export default CommandSpace;