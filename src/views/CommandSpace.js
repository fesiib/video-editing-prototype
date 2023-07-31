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
			<div> <span style={{fontWeight: "bold"}}> Text Command: </span> {curIntent.textCommand} </div>
			<div> <span style={{fontWeight: "bold"}}> Selected Transcript: </span>
				<div style={{
					display: "grid"
				}}>
				{
					curIntent.selectedTranscript.map((item, idx) => {
						return <span key={"selected_transcript" + idx}>
							{item.video.commonState.id} {item.start} - {item.finish}
						</span>
					})
				}
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
	</div>);
});

export default CommandSpace;