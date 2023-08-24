import React, { useState } from "react";

import { observer } from "mobx-react-lite";
import { action } from "mobx";

import useRootContext from "../hooks/useRootContext";
import SketchCanvas from "../components/command-space/SketchCanvas";



const CommandSpace = observer(function CommandSpace() {
	const { uiStore, domainStore } = useRootContext();
	const curIntent = domainStore.intents[domainStore.curIntentPos];
	const reversedIntents = [...domainStore.intents].reverse();

	const onChangeTextCommand = (event) => {
		curIntent.setTextCommand(event.target.value);
	}

	const onConfirmClick = action(() => {
		domainStore.confirmIntent();
	});

	const onCancelClick = action((intentPos) => {
		domainStore.cancelIntent(intentPos);
	});

	const onCopyClick = action((intentPos) => {
		domainStore.copyIntentToCurrent(intentPos);
	});

	const onIntentClick = action((intentPos) => {
		domainStore.setCurIntent(intentPos);
	});

	const onProcessClick = action(() => {
		domainStore.processIntent();
	});

	return (<div className="flex justify-between my-5">
		<div className="w-2/3 flex flex-col items-center mx-2">
			<h2> Describe your edit: </h2>
			<input id="textCommand" type="text" placeholder="intent" 
				className="w-full border p-2"
				onChange={onChangeTextCommand} 
			/>
			<div className="w-full flex flex-row gap-2 justify-between my-2 p-2 border">
				<SketchCanvas />
				<button 
					className="w-fit h-fit bg-indigo-300 hover:bg-indigo-400 text-black font-bold py-2 px-4 rounded"
					onClick={() => onProcessClick()}
					disabled={curIntent.textCommand === "" && curIntent.sketchCommand.length === 0}
				>
					Process
				</button>
			</div>
			{/* <div className="flex flex-col">
				<div> <span style={{fontWeight: "bold"}}> Text Command: </span> {curIntent.textCommand} </div>
				<div> <span style={{fontWeight: "bold"}}> Selected Transcript: </span>
					<div style={{
						display: "grid"
					}}>
					{
						curIntent.selectedTranscript.reduce((prevVal, curVal, idx) => {
							return prevVal + " " + curVal.text;
						}, "")
					}
					{
						curIntent.selectedTranscript.map((item, idx) => {
							return <span key={"selected_transcript" + idx}>
								{item.video.commonState.id} {item.start} - {item.finish}
							</span>
						})
					}
					</div>
				</div>
				<div> 
					<span style={{fontWeight: "bold"}}> Selected Periods: </span>
					<div style={{
						display: "grid"
					}}>
						{
							curIntent.selectedPeriods.map((item, idx) => {
								return <span key={"selected_period" + idx}>
									{item.video.commonState.id} {item.start} - {item.finish}
								</span>
							})
						}
					</div>
				</div>
				<div> <span style={{fontWeight: "bold"}}> Sketch: </span> {curIntent.sketchCommand} </div>
			</div> */}
		</div>
		<div className="w-1/3">
			<h2> Edits: </h2>
			<div className="border p-2">
				{reversedIntents.length === 0 ? (
					<div> No edits </div>
					) : (
					reversedIntents.map((intent, revIdx) => {
						const idx = reversedIntents.length - revIdx - 1;
						const title = intent.editOperation === null ? "None" : intent.editOperation.title;
						return <div  key={"intent" + idx} className="my-2 flex justify-between gap-2">
							<button
								className={(domainStore.curIntentPos === idx ? "bg-indigo-500 " : "bg-indigo-300  hover:bg-indigo-400 ")
									+ "text-left text-black font-bold py-2 px-4 rounded"
								}
								disabled={domainStore.curIntentPos === idx}
								onClick={() => onIntentClick(idx)}
							>
								{idx + 1} - {`[${title}]`}: "{intent.textCommand}"
							</button>
							<div className="w-fit flex gap-2 justify-center p-2">
								<button 
									className="w-fit bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
									onClick={() => onCancelClick(idx)}
									disabled={curIntent.activeEdits.length === 0}
								>
									Delete
								</button>
								{domainStore.curIntentPos === idx ? (<button 
									className="w-fit bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
									onClick={() => onConfirmClick()} 
									disabled={curIntent.activeEdits.length === 0}
								>
									Confirm
								</button>) 
								: (<button
									className="w-fit text-left bg-indigo-300 hover:bg-indigo-400 text-black py-2 px-4 rounded"
									onClick={() => onCopyClick(idx)}
								> Copy </button>)}
							</div>
						</div>
					}))
				}
			</div>
		</div>
	</div>);
});

export default CommandSpace;