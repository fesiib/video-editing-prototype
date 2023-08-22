import React, { useState } from "react";

import { observer } from "mobx-react-lite";


import useRootContext from "../hooks/useRootContext";


const CommandSpace = observer(function CommandSpace() {
	const { uiStore, domainStore } = useRootContext();
	const curIntent = domainStore.intents[domainStore.curIntentPos];

	const onChangeTextCommand = (event) => {
		curIntent.setTextCommand(event.target.value);
	}

	const onConfirmClick = () => {
		domainStore.confirmIntent();
	}

	const onCancelClick = () => {
		domainStore.cancelIntent();
	}

	return (<div className="flex flex-col items-center my-5">
		<form className="w-1/2 my-5">
			<label htmlFor="textCommand"> Describe your edit </label>
			<input id="textCommand" type="text" placeholder="intent" 
				className="w-full border p-2"
				onChange={onChangeTextCommand} 
			/>
		</form>
		
		<div className="flex flex-col">
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
				{/* {
					curIntent.selectedTranscript.map((item, idx) => {
						return <span key={"selected_transcript" + idx}>
							{item.video.commonState.id} {item.start} - {item.finish}
						</span>
					})
				} */}
				</div>
			</div>
			<div> <span style={{fontWeight: "bold"}}> Selected Periods: </span>
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
		</div>
		<div className="w-fit flex gap-2 justify-center m-5 p-2 border">
			<button 
				className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
				onClick={() => onCancelClick()}
				disabled={curIntent.activeEdits.length === 0}
			>
				Cancel
			</button>
			<button 
				className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
				onClick={() => onConfirmClick()} 
				disabled={curIntent.activeEdits.length === 0}
			>
				Confirm
			</button>
		</div>
		<div className="w-fit m-5 p-5 border">
			{domainStore.intents.map((intent, idx) => {
				if (intent.id === curIntent.id) {
					return null;
				}
				return <div key={"intent" + idx}>
					Intent {idx + 1}: "{intent.textCommand}" #{intent.activeEdits.length}
				</div>
			})}
		</div>
	</div>);
});

export default CommandSpace;