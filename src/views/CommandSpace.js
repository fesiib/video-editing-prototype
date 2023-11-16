import React, { useEffect, useRef, useState } from "react";

import { observer } from "mobx-react-lite";
import { action, set, toJS } from "mobx";

import { AiOutlineHistory } from "react-icons/ai";
import { AiOutlineSend } from "react-icons/ai";

import useRootContext from "../hooks/useRootContext";
import SketchCanvas from "../components/command-space/SketchCanvas";

import { requestAmbiguousParts } from "../services/pipeline";
import { IconContext } from "react-icons";

import ReactLoading from "react-loading";


const CommandSpace = observer(function CommandSpace() {
	const { userStore, uiStore, domainStore } = useRootContext();
	const systemSetting = userStore.systemSetting;
	
	const curTab = domainStore.curTab;
	
	const selectedEdits = uiStore.timelineControls.selectedTimelineItems;

	const selectedSuggestedEdits = selectedEdits.filter((item) => {
		return item.isSuggested;
	});
	const textCommandLimit = 200;
	const textCommandRef = useRef(null);

	const [shouldSketch, setShouldSketch] = useState(false);

	const applyHighlights = (text, allAmbiguousParts) => {
		let result = text.replace(/\n$/g, '\n\n');
		let ambiguousParts = [];
		for (const context in allAmbiguousParts) {
			if (context !== "spatial") {
				continue;
			}
			ambiguousParts = [...ambiguousParts, ...allAmbiguousParts[context]];
		}
		ambiguousParts.sort((a, b) => {
			return b.offset - a.offset;
		});
		for (const part of ambiguousParts) {
			let leftResult = result.slice(0, part.offset);
			let rightResult = result.slice(part.offset);
			result = leftResult + rightResult.replace(part.text, `<mark>${part.text}</mark>`)
		}
		return result;
	};

	const onChangeTextCommand = action((event) => {
		const text = event.target.value;
		curTab.setTextCommand(text);
		uiStore.logData("commandspaceTextChange", {
			text: text,
		});
	});

	const onTextAreaScroll = (event) => {
		const scrollTop = event.target.scrollTop;
		const divBackDrop = textCommandRef.current.querySelector("#textarea-backdrop");
		divBackDrop.scrollTop = scrollTop;
	};

	const onMarkClick = action((mark) => {
		const text = mark.innerText;
		const idx = curTab.textCommand.indexOf(text);
		const len = text.length;
		if (mark.style.backgroundColor === "lightgreen") {
			mark.style.backgroundColor = "lightblue";
		}
		else {
			mark.style.backgroundColor = "lightgreen";
		}
	});

	const onTextAreaClick = action((event) => {
		const divBackDrop = textCommandRef.current.querySelector("#textarea-backdrop");
		const divHighlights = textCommandRef.current.querySelector("#textarea-highlights");
		const marks = divHighlights.querySelectorAll("mark");
		const intersectedMarks = [];
		for (const mark of marks) {
			const rect = mark.getBoundingClientRect();
			if (rect.top < event.clientY && event.clientY < rect.bottom
				&& rect.left < event.clientX && event.clientX < rect.right
			) {
				intersectedMarks.push(mark);
			}
		}
		if (intersectedMarks.length === 0) {
			return;
		}
		for (const mark of intersectedMarks) {
			onMarkClick(mark);
		}
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
		if (uiStore.commandSpaceControls.requestingAmbiguousParts
			|| words === null
			|| words.length < 2
		) {
			setShouldSketch(() => false);
			const divHighlights = textCommandRef.current.querySelector("#textarea-highlights");
			if (divHighlights !== null && divHighlights !== undefined) {
				divHighlights.innerHTML = text;
			}
			return;
		}
		setShouldSketch(() => true);
		return;
		// skip processing 
		uiStore.commandSpaceControls.requestingAmbiguousParts = true;
		requestAmbiguousParts({
			input: text,
		}, 0).then(action((response) => {
			const ambiguousParts = response.ambiguousParts;
			// https://codersblock.com/blog/highlight-text-inside-a-textarea/
			// const highlightedText = applyHighlights(text, ambiguousParts);
			// const divHighlights = textCommandRef.current.querySelector("#textarea-highlights");
			// divHighlights.innerHTML = highlightedText;
			if (ambiguousParts !== undefined && ambiguousParts !== null 
				&& "spatial" in ambiguousParts) {
				setShouldSketch(() => ambiguousParts["spatial"].length > 0);
			}
			uiStore.commandSpaceControls.requestingAmbiguousParts = false;
		})).catch(action((error) => {
			console.log(error);
			uiStore.commandSpaceControls.requestingAmbiguousParts = false;
			setShouldSketch(() => false);
		}));
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
						{`Tab ${curTab.idx}: `}
					</span>
					<span className="font-bold">
						{ curTab.title }
					</span>
				</span>
			</div>
			{systemSetting ? (
				<div className="w-full p-1 bg-gray-100">
					<div className="flex flex-row w-full gap-2"> 
						<div className="flex flex-col w-full gap-1 border p-1">
							<div
								id="textarea-container"
								className="textarea-container relative w-full h-full"
								ref={textCommandRef}
							>
								<div  
									id="textarea-backdrop"
									className="textarea-backdrop absolute w-full h-full"
								>
									<div
										id="textarea-highlights"
										className="textarea-highlights z-0"
										style = {{
											pointerEvents: "auto",
										}}
									>
									</div>
								</div>
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
									onScroll={onTextAreaScroll}
									onClick={onTextAreaClick}
									onKeyDown={onKeyDown}
								/>
							</div>
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

export default CommandSpace;