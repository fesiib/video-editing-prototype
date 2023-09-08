import React, { useEffect, useRef, useState } from "react";

import { observer } from "mobx-react-lite";
import { action, set, toJS } from "mobx";

import useRootContext from "../hooks/useRootContext";
import SketchCanvas from "../components/command-space/SketchCanvas";
import axios from "axios";
import { requestAmbiguousParts } from "../services/pipeline";


const CommandSpace = observer(function CommandSpace() {
	const { userStore, uiStore, domainStore } = useRootContext();
	const systemSetting = userStore.systemSetting;
	
	const curIntent = domainStore.intents[domainStore.curIntentPos];
	
	const selectedEdits = uiStore.timelineControls.selectedTimelineItems;

	const selectedSuggestedEdits = selectedEdits.filter((item) => {
		return item.isSuggested;
	});
	const textCommandLimit = 200;
	const textCommandRef = useRef(null);

	const applyHighlights = (text, ambiguousParts) => {
		let result = text.replace(/\n$/g, '\n\n');
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
		curIntent.setTextCommand(text);
	});

	const onTextAreaScroll = (event) => {
		const scrollTop = event.target.scrollTop;
		const divBackDrop = textCommandRef.current.querySelector("#textarea-backdrop");
		divBackDrop.scrollTop = scrollTop;
	};

	const onMarkClick = action((mark) => {
		const text = mark.innerText;
		const idx = curIntent.textCommand.indexOf(text);
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
		domainStore.processIntent(
			domainStore.processingModes.fromScratch,
			{
				start: 0,
				finish: domainStore.projectMetadata.duration,
			}
		);
	});


	const onProcessingMode = action((event) => {
		curIntent.setProcessingMode(event.target.value);

	});

	useEffect(() => {
		const text = curIntent.textCommand;
		const words = text.trim().match(/\S+/g);
		if (textCommandRef.current === null) {
			return;
		}
		if (uiStore.commandSpaceControls.requestingAmbiguousParts
			|| words === null
			|| words.length < 2
		) {
			const divHighlights = textCommandRef.current.querySelector("#textarea-highlights");
			if (divHighlights !== null && divHighlights !== undefined) {
				divHighlights.innerHTML = text;
			}
			return;
		}
		uiStore.commandSpaceControls.requestingAmbiguousParts = true;
		requestAmbiguousParts({
			input: text,
		}).then((response) => {
			const ambiguousParts = response.ambiguousParts;
			// https://codersblock.com/blog/highlight-text-inside-a-textarea/
			const highlightedText = applyHighlights(text, ambiguousParts);
			const divHighlights = textCommandRef.current.querySelector("#textarea-highlights");
			divHighlights.innerHTML = highlightedText;
			uiStore.commandSpaceControls.requestingAmbiguousParts = false;
		}).catch((error) => {
			console.log(error);
			uiStore.commandSpaceControls.requestingAmbiguousParts = false;
		});
	}, [curIntent.textCommand]);

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
									placeholder="description"
									value={curIntent.textCommand}
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
								/>
							</div>
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