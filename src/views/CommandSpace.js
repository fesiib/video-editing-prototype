import React, { useState } from "react";

import { observer } from "mobx-react-lite";

import useRootContext from "../hooks/useRootContext";


const CommandSpace = observer(function CommandSpace() {
	const { uiStore, domainStore } = useRootContext();
	const curIntent = domainStore.intents[domainStore.curIntentPos];

	const onChangeTextCommand = (event) => {
		curIntent.setTextCommand(event.target.value);
	}

	return (<div>
		<form >
			<label htmlFor="textCommand"> Describe your edit </label>
			<input id="textCommand" type="text" placeholder="intent" 
				onChange={onChangeTextCommand} 
				style={{
					"width" : "50%",
					"border": "2px solid",
					"margin": "10px",
					"padding": "5px",
				}} 
			/>
		</form>
		
		<div style={{
			display: "grid"
		}}>
			<span> Text Command: {curIntent.textCommand} </span>
			<span> Selected Transcript: {curIntent.selectedTranscript} </span>
			<span> Selected Time Periods: {curIntent.selectedPeriods} </span>
			<span> Selected Frame-Sketch: {curIntent.sketchCommand} </span>
		</div>
	</div>);
});

export default CommandSpace;