import React, { useState } from "react";

import { observer } from "mobx-react-lite";
import { action, toJS } from "mobx";

import useRootContext from "../hooks/useRootContext";
import SketchCanvas from "../components/command-space/SketchCanvas";


const CommandSpace = observer(function CommandSpace() {
	const { userStore, uiStore, domainStore } = useRootContext();
	const systemSetting = userStore.systemSetting;
	
	const curIntent = domainStore.intents[domainStore.curIntentPos];
	
	const selectedEdits = uiStore.timelineControls.selectedTimelineItems;

	const selectedSuggestedEdits = selectedEdits.filter((item) => {
		return item.isSuggested;
	});

	const reversedIntents = [...domainStore.intents].reverse();
	const textCommandLimit = 200;

	const onChangeTextCommand = (event) => {
		curIntent.setTextCommand(event.target.value);
	}

	const onProcessClick = action(() => {
		domainStore.processIntent();
	});


	const onProcessingMode = action((event) => {
		curIntent.setProcessingMode(event.target.value);

	});

	return (<div className="w-full flex flex-col items-center">
		<h2 className="w-full"> 
			{
				curIntent.historyPos === curIntent.history.length - 1 ? (
					<span> New 
					</span>
				) : (
					<span> History
					</span>
				)
			}
			{
				curIntent.summary === "" ? (
					<span> Edit {curIntent.idx}: 
						<span 
							className="italic text-gray-400"
						> describe your edit </span> 
					</span>
				) : (
					<span> Edit {curIntent.idx}: {curIntent.summary} </span>
				)
			}
		</h2>
		{systemSetting ? (
			domainStore.processingIntent ? (
				<div> Processing... </div>
			) : (
				<div className="w-full p-1 bg-gray-100">
					<div className="flex flex-row w-full gap-2"> 
						<div className="flex flex-col w-full gap-1 border p-1">
							<textarea 
								id="textCommand" 
								maxLength={textCommandLimit}
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
								> {curIntent.textCommand.length}/{textCommandLimit}</span>
							</div>
						</div>
						<div className="flex flex-col gap-1 justify-end items-end">
							{/* <div className="flex flex-col">

								<label htmlFor="processingMode"
									className="w-full"
								> Mode: </label>
								<select id={"processingMode"} value={curIntent.processingMode} onChange={onProcessingMode}
									className="p-1"
								>
									<option value={domainStore.processingModes.fromScratch}> From scratch </option>
									<option value={domainStore.processingModes.addMore}> Add more </option>
									<option value={domainStore.processingModes.adjustSelected}> Adjust existing </option>
								</select>
							</div> */}
							<button 
								className="w-fit h-fit bg-indigo-300 text-black py-2 px-2 rounded hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
								onClick={() => onProcessClick()}
								disabled={curIntent.processingAllowed === false}
							>
								Submit
							</button>
						</div>
					</div>
					{
						(selectedSuggestedEdits.length !== 1 || domainStore.processingIntent
						) ? null : (
							<div className="flex flex-col justify-start px-1 divider-1">
								<div className="flex flex-col flex-wrap w-full">
									<h2 className="text-sm"> Last description: </h2>
									<div className="flex flex-row flex-wrap gap-1 text-s">
									{
										selectedEdits[0].contribution.map((single, idx) => {
											const text = single.text;
											const type = single.type.filter((ref) => {
												return !ref.startsWith("custom.") || ref === `custom.${curIntent.editOperationKey}`;
											});
											return (<div 
												className={"relative h-fit"}
												key={`contribution-${idx}-${text}`}
											> 
												{type.map((refType, t_idx) => {
													const t = refType.startsWith("custom.") ? "custom" : refType;
													const typeClassName = "absolute w-full ";
													return (<div 
														className={typeClassName}
														style={{
															height: `${(1 / type.length) * 100}%`,
															bottom: `${(t_idx / type.length) * 100}%`,
															backgroundColor: uiStore.referenceTypeColorPalette[t],
														}}
														key={`contribution-${idx}-${text}-${t}`}
													>
													</div>);
												})}
												{text}
											</div>);
										})
									}
									{/* {JSON.stringify(toJS(selectedEdits[0].contribution))} */}
									</div>
								</div>
							</div>
						)
					}
				</div>
			)
		) : null}
	</div>);
});

export default CommandSpace;