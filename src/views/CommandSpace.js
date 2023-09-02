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
				<div className="flex flex-col gap-2 p-2 w-full bg-gray-100"> 
					<div className="flex flex-row">
						<input 
							id="textCommand" 
							type="text"
							placeholder="description"
							value={curIntent.textCommand}
							className="w-full border p-1"
							onChange={onChangeTextCommand} 
						/>
						<select value={processMode} onChange={onProcessModeChange}>
							<option value={fromScratch}> From scratch </option>
							<option value={addMore}> Add more </option>
							<option value={adjustSelected}> Adjust selected </option>
						</select>
					</div>
					<div className="w-full flex flex-row gap-2 justify-between">
						<SketchCanvas />
						<div className="flex flex-col gap-1">
							<button 
								className="w-fit h-fit bg-indigo-300 text-black py-2 px-2 rounded hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
								onClick={() => onProcessClick()}
								disabled={curIntent.textCommand === ""}
							>
								Submit
							</button>
							{/* <label htmlFor={"considerEdits"}> iterate </label>
							<input type="checkbox" id="considerEdits" name="considerEdits" value="considerEdits" checked={curIntent.considerEdits} onChange={onConsiderEditsClick} /> */}
						</div>
					</div>
				</div>
			)
		) : null}
	</div>);
});

export default CommandSpace;