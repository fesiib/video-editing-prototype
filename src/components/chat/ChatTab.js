import React, { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowAltCircleDown, faArrowLeft, faArrowUp, faArrowUp19, faCamera, faCancel, faCaretDown, faCaretRight, faCheck, faCross, faExpand, faExpandArrowsAlt, faInfoCircle, faPlus, faRightFromBracket, faSpinner, faX, faXmark } from "@fortawesome/free-solid-svg-icons";

import CommandSpace from "../../views/CommandSpace";
import ChatEditPreview from "./ChatEditPreview";

import useRootContext from "../../hooks/useRootContext";
import { action, reaction, toJS } from "mobx";
import { Divider } from "@mui/material";

const UserCommandBubble = observer(function UserCommandBubble({ bubble }) {
	const { userStore, uiStore, domainStore } = useRootContext();
	const content = bubble.content;
	const time = new Date(bubble.time).toLocaleTimeString("en-US", {
		hour12: false,
		hour: "numeric",
		minute: "numeric",
	});
	const isAddMore = bubble.requestProcessingMode === domainStore.processingModes.addMore;
	return (<>
		<div className="self-end mb-3 mr-4 text-left w-fit">
			<div className="text-xs text-right">
				{time}
			</div>
			<div className="bg-slate-200 w-auto p-2 mt-1 rounded-md">
				{
					isAddMore ? (
						<div className="font-semibold">
							Adding More Edits for:
						</div>
					) : (
						<div className="font-semibold">
							User Command:
						</div>
					)
				}
				<div className="text-m">
					{content}
				</div>
			</div>
		</div>
		<Divider />
	</>);
});

const ParsingResultBubble = observer(function ParsingResultBubble({ bubble }) {
	const { userStore, uiStore, domainStore } = useRootContext();
	
	const parsingResultsRef = useRef(null);
	const [isExplanationOpen, setIsExplanationOpen] = useState(false);

	const onExplanationClick = action((event) => {
		setIsExplanationOpen((prev) => !prev);
	});

	const content = bubble.content;
	const time = new Date(bubble.time).toLocaleTimeString("en-US", {
		hour12: false,
		hour: "numeric",
		minute: "numeric",
	});

	let parsingResultStarts = [0];
	for (let range of [
			...bubble.parsingResult.temporal,
			...bubble.parsingResult.spatial,
			...bubble.parsingResult.edit,
			...bubble.parsingResult.custom,
		]
	) {
		if (range === null) {
			continue;
		}
		parsingResultStarts.push(range.start);
		parsingResultStarts.push(range.end);
	}
	parsingResultStarts.sort((a, b) => a - b);

	const onBreakdownMouseEvent = action((event, range, rgb) => {
		const isEntering = event.type === "mouseenter";
		const parsingResultSpans = parsingResultsRef.current.getElementsByTagName("span");
		for (const span of parsingResultSpans) {
			const start = parseInt(span.getAttribute("data-start"));
			const end = parseInt(span.getAttribute("data-end"));
			const defaultColor = span.getAttribute("data-default-color");
			const highlightColor = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.5)`;
			if (range.start <= start && end <= range.end) {
				if (isEntering) {
					event.target.style.backgroundColor = highlightColor;
					event.target.style.borderTop = "1px solid black";
					event.target.style.borderBottom = "1px solid black";

					span.style.backgroundColor = highlightColor;
					span.style.borderTop = "1px solid black";
					span.style.borderBottom = "1px solid black";
				}
				else {
					event.target.style.backgroundColor = defaultColor;
					event.target.style.borderTop = "none";
					event.target.style.borderBottom = "none";

					span.style.backgroundColor = defaultColor;
					span.style.borderTop = "none";
					span.style.borderBottom = "none";
				}
			}
		}
	});

	const breakdownSpan = action((range, rgb) => {
		const text = bubble.parsingResult.text.slice(range.start, range.end);
		return (<div>
			<span 
				key={`temporal-${range.start}-${range.end}`}
				style = {{
					backgroundColor: `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.2)`,
				}}
				onMouseEnter={action((event) => onBreakdownMouseEvent(event, range, rgb))}
				onMouseLeave={action((event) => onBreakdownMouseEvent(event, range, rgb))}
			>
				{text}
			</span>
			<span>;</span>
		</div>);
	});


	return (<div className="mb-3 w-fit">
		<div className="text-xs text-left">
			{time}
		</div>
		<div className="bg-slate-200 w-auto p-2 mr-10 mt-1 rounded-md">
			<div className="font-semibold">
				{content}
			</div>
			<div ref={parsingResultsRef}>
				{
					parsingResultStarts.map((start, idx) => {
						const end = (idx + 1 === parsingResultStarts.length ? 
							bubble.parsingResult.text.length :
							parsingResultStarts[idx + 1]
						);
						const text = bubble.parsingResult.text.slice(start, end);
						let backgroundTransparency = 0;
						let rgb = [0, 0, 0];
						for (let range of bubble.parsingResult.temporal) {
							if (range.start <= start && end <= range.end) {
								backgroundTransparency = 0.2;
								rgb[0] = 255;
							}
						}
						for (let range of bubble.parsingResult.spatial) {
							if (range.start <= start && end <= range.end) {
								backgroundTransparency = 0.2;
								rgb[1] = 255;
							}
						}
						for (let range of bubble.parsingResult.edit) {
							if (range.start <= start && end <= range.end) {
								backgroundTransparency = 0.2;
								rgb[2] = 255;
							}
						}
						for (let range of bubble.parsingResult.custom) {
							if (range.start <= start && end <= range.end) {
								backgroundTransparency = 0.2;
								rgb[0] = 255;
								rgb[1] = 255;
								rgb[2] = 0;
							}
						}
						return (<span
							key={`parsing-result-${start}-${end}`}
							data-start={start}
							data-end={end}
							data-default-color={`rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${backgroundTransparency})`}
							style={{
								backgroundColor: `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${backgroundTransparency})`,
							}}
						>
							{text}
						</span>);

					})
				}
			</div>
			<div className="text-s mb-1">
				<button
					onClick={onExplanationClick}
					className="hover:text-gray-500"
				>
					<FontAwesomeIcon
						icon={isExplanationOpen ? faCaretDown : faCaretRight}
						className="mx-1 w-2"
					/>
					{" "} <span className="underline">Reference Breakdown </span>
				</button>
				{
					isExplanationOpen ? (
						<div>
							<div className="flex flex-row gap-1 flex-wrap"> 
								<span className="text-s italic"> Temporal: </span> 
								{bubble.parsingResult.temporal.length === 0 ? (
									<span className="text-s"> N/A </span>
								) : (
									bubble.parsingResult.temporal.map(
										(range) => breakdownSpan(range, [255, 0, 0])
									)
								)} 
							</div>

							<div className="flex flex-row gap-1 flex-wrap"> 
								<span className="text-s italic"> Spatial: </span> 
								{bubble.parsingResult.spatial.length === 0 ? (
									<span className="text-s"> N/A </span>
								) : (
									bubble.parsingResult.spatial.map(
										(range) => breakdownSpan(range, [0, 255, 0])
									)
								)}
							</div>
							
							<div className="flex flex-row gap-1 flex-wrap">  
								<span className="text-s italic"> Edit: </span> 
								{bubble.parsingResult.edit.length === 0 ? (
									<span className="text-s"> N/A </span>
								) : (
									bubble.parsingResult.edit.map(
										(range) => breakdownSpan(range, [0, 0, 255])
									)
								)} 
							</div>

							<div className="flex flex-row gap-1 flex-wrap"> 
								<span className="text-s italic"> Parameters: </span>
								{bubble.parsingResult.custom.length === 0 ? (
									<span className="text-s"> N/A </span>
								) : (
									bubble.parsingResult.custom.map(
										(range) => breakdownSpan(range, [255, 255, 0])
									)
								)}
							</div>
						</div>
					) : (null)
				}
			</div>
			<div
				className="text-xs text-left"
			>
			</div>
		</div>
	</div>);
});

const EditBubble = observer(function EditBubble({ bubble }) {
	const { userStore, uiStore, domainStore } = useRootContext();
	
	const [isExplanationOpen, setIsExplanationOpen] = useState(true);

	const onExplanationClick = action((event) => {
		setIsExplanationOpen((prev) => !prev);
	});

	const setToggle = action((event) => {
		//TODO: add edit or not
		const edits = bubble.setToggle(!bubble.toggle);
		if (edits.length > 0) {
			uiStore.selectTimelineObjects(edits);
			let minStart = edits[0].commonState.start;
			for (let edit of edits) {
				minStart = Math.min(minStart, edit.commonState.offset);
			}
			uiStore.timelineControls.playPosition = minStart;
		}
	});

	const content = bubble.content;
	const time = new Date(bubble.time).toLocaleTimeString("en-US", {
		hour12: false,
		hour: "numeric",
		minute: "numeric",
	});
	const toggle = bubble.toggle;
	const edit = bubble.edit;
	const editIdx = bubble.timeOrderedIdxGlobal;

	return (<div className="mb-3 w-fit">
		<div className="text-xs text-left">
			{time}
		</div>
		<div
			className={`bg-slate-200 h-fit p-2 rounded-md ${
				toggle ? "border-2 border-indigo-300" : ""
			}`}
		>
			<div className="">
				{content}
			</div>
			{/* TODO: update image */}
			{edit !== null ? (<>
				<div className="flex flex-row items-center hover:cursor-pointer">
					<button
						className={`w-5 h-5 mr-2 rounded-full border border-black flex items-center justify-center focus:outline-none ${
							toggle ? "bg-indigo-300 text-black" : ""
						}`}
						onClick={setToggle}
					>
						{toggle && <FontAwesomeIcon icon={faCheck} />}
					</button>
					<div className="font-semibold hover:cursor-pointer" onClick={setToggle}>
						Edit #{editIdx + 1}
					</div>
				</div>
				<div className="text-s mb-1">
					<button
						onClick={onExplanationClick}
						className="hover:text-gray-500"
					>
						<FontAwesomeIcon
							icon={isExplanationOpen ? faCaretDown : faCaretRight}
							className="mx-1 w-2"
						/>
						{" "} <span className="underline">Explanation </span>
					</button>
					{
						isExplanationOpen ? (
							<div>
								{edit.explanation.map((explanation, idx) => {
									const label = idx === 0 ? "Temporal" : "Spatial";
									let trimmed_explanation = explanation.trim();
									if (trimmed_explanation === "") {
										trimmed_explanation = "None";
									}
									return (<div key={`explanation-${idx}`} className="text-s">
										<span className="italic">
											{label}:
										</span>
										{" "}
										<span>
											{trimmed_explanation}
										</span>
									</div>);
								})}
							</div>
						) : (null)
					}
				</div>
				<div>
					<span className="text-xs">
						Preview (not accurate): 
					</span>
				</div>
				<div
					onClick={setToggle}
					className=" hover:cursor-pointer"
				>
					<ChatEditPreview edit={edit} />
				</div>
			</>) : (null)}
			{/* <img src={SnapshotImg} alt="snapshot" width="280" /> */}
		</div>
	</div>);
});

const SystemMessageBubble = observer(function SystemMessageBubble({ bubble }) {
	const { userStore, uiStore, domainStore } = useRootContext();
	const content = bubble.content;
	const time = new Date(bubble.time).toLocaleTimeString("en-US", {
		hour12: false,
		hour: "numeric",
		minute: "numeric",
	});
	return (<div className="mb-3 w-fit h-fit">
		<div className="text-xs text-left">
			{time}
		</div>
		<div className="bg-slate-200 w-auto p-2 mr-10 mt-1 rounded-md">
			{content}
		</div>
	</div>);
});

const SummaryMessageBubble = observer(function SummaryMessageBubble({ 
	bubble, relevantEditBubbles, isLastSummaryForRequest, isFirstSummary }) {
	const { userStore, uiStore, domainStore } = useRootContext();
	const curTab = domainStore.curTab;

	const setToggle = action((event) => {
		let addedEdits = [];
		for (let otherBubble of relevantEditBubbles) {
			if (otherBubble.type === domainStore.bubbleTypes.edit
				&& otherBubble.processed === true
				&& otherBubble.toggle === bubble.toggle
			) {
				const edits = otherBubble.setToggle(!otherBubble.toggle);
				addedEdits = addedEdits.concat(edits);
			}
		}
		bubble.setToggle(!bubble.toggle);
		if (addedEdits.length > 0) {
			uiStore.selectTimelineObjects(addedEdits);
			let minStart = addedEdits[0].commonState.start;
			for (let edit of addedEdits) {
				minStart = Math.min(minStart, edit.commonState.offset);
			}
			uiStore.timelineControls.playPosition = minStart;
		}
	});

	const setEditToggle = action((event, curEditBubble) => {
		const edits = curEditBubble.setToggle(!curEditBubble.toggle);
		if (edits.length > 0) {
			uiStore.selectTimelineObjects(edits);
			let minStart = edits[0].commonState.start;
			for (let edit of edits) {
				minStart = Math.min(minStart, edit.commonState.offset);
			}
			uiStore.timelineControls.playPosition = minStart;
		}
	});

	const requestMore = action((event) => {
		uiStore.canvasControls.sketching = false;
		domainStore.processRequest(
			domainStore.processingModes.addMore,
			{
				start: 0,
				finish: domainStore.projectMetadata.duration,
			}
		);
	});

	const moveToNewTab = action((event) => {
		// ask for confirmation
		if (!window.confirm(domainStore.MOVE_TO_NEW_TAB_CONFIRMATION)) {
			return;
		}
		domainStore.moveLastToNewTab(bubble);
	});

	const scrollToPrevCommand = action((event) => {
		const chatTab = document.getElementById("chat-tab");
		if (chatTab) {
			let newScrollTop = -2;
			for (let child of chatTab.children) {
				if (child.id === bubble.id) {
					newScrollTop = -1;
					continue;
				}
				if (child.id.startsWith(bubble.BUBBLE_ID_PREFIX)
					&& newScrollTop === -1
				) {
					newScrollTop = child.offsetTop;
					break;
				}
			}
			if (newScrollTop >= 0) {
				chatTab.scrollTop = newScrollTop;
			}
		}
	});

	const content = bubble.content;
	const time = new Date(bubble.time).toLocaleTimeString("en-US", {
		hour12: false,
		hour: "numeric",
		minute: "numeric",
	});
	const toggle = bubble.toggle;

	useEffect(() => {
		const disposer = reaction(() => {
			const toggles = relevantEditBubbles.map((editBubble) => editBubble.toggle);
			return toggles;
		}, (toggles) => {
			if (toggles.length === 0) {
				return;
			}
			const allSame = toggles.every((toggle) => toggle === toggles[0]);
			if (allSame) {
				bubble.setToggle(toggles[0]);
			}
		});
		return () => disposer();
	}, [relevantEditBubbles.length, bubble.id]);

	return (<div className="mb-3 w-fit h-fit" id={bubble.id}>
		<div className="text-xs text-left">
			{time}
		</div>
		<div className="bg-slate-200 w-auto p-2 mr-10 mt-1 rounded-md">
			<div className="font-semibold flex flex-row justify-between gap-2">
				<div className="p-1">
					Summary of Edits
				</div>
			</div>
			<div>
				{content}
			</div>
			<div className="mb-3 flex flex-row items-center">
				{"  "}
				<button
					className={`w-4 h-4 mr-1 border border-black flex items-center justify-center focus:outline-none ${
						toggle ? "bg-indigo-300 text-black" : ""
					}`}
					onClick={setToggle}
				>
					{toggle && <FontAwesomeIcon icon={faCheck} />}
				</button>
				{toggle ? "Deselect All" : "Select All"}
			</div>
			<div>
				{relevantEditBubbles.map((editBubble) => {
					if (editBubble.type !== domainStore.bubbleTypes.edit) {
						return null;
					}
					if (editBubble.processed === false) {
						return null;
					}
					// small button with the id of the edit
					const editIdx = editBubble.timeOrderedIdxGlobal;
					const editToggle = editBubble.toggle;
					return (<div
						key={`edit-${editIdx}`}
						id={`edit-${editIdx}`}
						className="flex flex-row items-center mb-1"
					>
						<button
							className={`w-4 h-4 mr-1 border border-black flex items-center justify-center focus:outline-none ${
								editToggle ? "bg-indigo-300 text-black" : ""
							}`}
							onClick={(event) => setEditToggle(event, editBubble)}
						>
							{editToggle && <FontAwesomeIcon icon={faCheck} />}
						</button>
						<div className="text-s">
							Edit #{editIdx + 1}
						</div>
					</div>);
				})}
			</div>
			<div className="flex flex-col gap-2">
				{
					isLastSummaryForRequest ? (<>
						<button
							className={"w-fit h-fit bg-indigo-200 text-black p-1 rounded hover:bg-indigo-300"}
							onClick={requestMore}
						>
							<FontAwesomeIcon icon={faPlus} className="mr-1" />
							Get More Edits
						</button>
						<button
							className={"w-fit h-fit bg-green-200 text-black p-1 rounded hover:bg-green-300"}
							onClick={moveToNewTab}
						>
							<FontAwesomeIcon icon={faRightFromBracket} className="mr-1" />
							<span> Move to New Tab </span>
						</button>
					</>) : (null)
				}
				{
					isFirstSummary === false ? (
						<button
							className={"w-fit h-fit bg-gray-300 text-black p-1 rounded hover:bg-gray-400"}
							onClick={scrollToPrevCommand}
						>
							<FontAwesomeIcon icon={faArrowLeft} className="mr-1" />
							<span> Prev. Summary </span>
						</button>
					) : (null)
				}
			</div>
		</div>
	</div>);
});

const ChatTab = observer(function ChatTab() {
	const { userStore, uiStore, domainStore } = useRootContext();

	const curTab = domainStore.curTab;

	const timeOrderedBubbles = [...curTab.timeOrderedBubbles].reverse();
	const firstSummaryBubbleId = timeOrderedBubbles.reduce((bubbleId, bubble) => {
		if (bubble.type === domainStore.bubbleTypes.summaryMessage) {
			return bubble.id;
		}
		return bubbleId;
	}, null);

	const [showScrollUp, setShowScrollUp] = useState(false);

	const onScroll = action((event) => {
		const chatTab = document.getElementById("chat-tab");
		if (chatTab) {
			setShowScrollUp(chatTab.scrollTop > chatTab.clientHeight / 2);
		}
	});

	const onScrollUpClick = action((event) => {
		const chatTab = document.getElementById("chat-tab");
		if (chatTab) {
			chatTab.scrollTop = 0;
		}
	});

	const cancelRequest = action((event) => {
		domainStore.cancelRequest();
	});

	useEffect(action(() => {
		const chatTab = document.getElementById("chat-tab");
		// when chatTab is at the top, scroll to the top
		if (chatTab && chatTab.scrollHeight > chatTab.clientHeight) {
			chatTab.scrollTop = 0;
			setShowScrollUp(false);
		}
		
		// // set TimeOrderIdxs
		// let firstEditBubble = null;
		// let editBubbleIdx = -1;
		// for (let i = timeOrderedBubbles.length - 1; i >= 0; i--) {
		// 	const bubble = timeOrderedBubbles[i];
		// 	if (bubble.type === domainStore.bubbleTypes.edit) {
		// 		if (firstEditBubble === null || firstEditBubble.requestId !== bubble.requestId) {
		// 			firstEditBubble = bubble;
		// 			editBubbleIdx = -1;
		// 		}
		// 		editBubbleIdx += 1;
		// 		bubble.setTimeOrderedIdx(editBubbleIdx);
		// 	}
		// }
	}), [
		timeOrderedBubbles.length,
		domainStore.curTabPos,
	]);

    return (
        <div>
			<CommandSpace />
            <div 
				className="relative overflow-auto mt-3 flex flex-col gap-3"
				style={{ maxHeight: uiStore.chatConst.maxHeight }}
				id={"chat-tab"}
				onScroll={onScroll}
			>
				{
					showScrollUp ? (
						<div
							className="sticky top-1 m-auto p-2 w-fit z-50 bg-indigo-200 rounded-full flex items-center justify-center hover:bg-indigo-300 cursor-pointer"
							onClick={onScrollUpClick}
						>
							<FontAwesomeIcon icon={faArrowUp} className="mr-2"/>
							Scroll Up
						</div>
					) : (null)
				}
				
				{/* Generating one */}
				{
					domainStore.processingRequest ? (
						// loading
						<div className="flex flex-row items-center mb-3 font-semibold">
							<FontAwesomeIcon
								icon={faSpinner}
								spin
								className="mr-2"
								style={{ fontSize: "22px" }}
							/>{" "}
							Generating...
							<button 
								onClick={cancelRequest}
								className="w-fit h-fit bg-gray-200 text-black p-1 rounded hover:bg-gray-300 ml-2"
							>
								<FontAwesomeIcon icon={faXmark} className="mr-2" />
								Cancel
							</button>
						</div>
					) : (null)
				}

				{
					timeOrderedBubbles.map((bubble, idx) => {
						if (bubble.processed === false) {
							return null;
						}
						if (bubble.type === domainStore.bubbleTypes.userCommand) {
							return <UserCommandBubble bubble={bubble} />;
						}
						if (bubble.type === domainStore.bubbleTypes.parsingResult) {
							return <ParsingResultBubble bubble={bubble} />;
						}
						if (bubble.type === domainStore.bubbleTypes.edit) {
							// let editIdx = 0;
							// for (let i = idx + 1; i < timeOrderedBubbles.length; i++) {
							// 	if (timeOrderedBubbles[i].requestId !== bubble.requestId) {
							// 		break;
							// 	}
							// 	if (timeOrderedBubbles[i].type === domainStore.bubbleTypes.edit
							// 		&& timeOrderedBubbles[i].processed === true
							// 	) {
							// 		editIdx += 1;
							// 	}
							// }
							return <EditBubble bubble={bubble} />;
						}
						if (bubble.type === domainStore.bubbleTypes.systemMessage) {
							return <SystemMessageBubble bubble={bubble} />;
						}
						if (bubble.type === domainStore.bubbleTypes.summaryMessage) {
							const isLastSummaryForRequest = (
								idx === 0 || timeOrderedBubbles[idx - 1].requestId !== bubble.requestId
							);
							let isFirstSummary = firstSummaryBubbleId === bubble.id;
							let relevantEditBubbles = [];
							for (let i = idx + 1; i < timeOrderedBubbles.length; i++) {
								if (timeOrderedBubbles[i].requestId !== bubble.requestId) {
									break;
								}
								if (timeOrderedBubbles[i].type !== domainStore.bubbleTypes.edit) {
									break;
								}
								if (timeOrderedBubbles[i].processed === true) {
									relevantEditBubbles.push(timeOrderedBubbles[i]);
								}
							}
							return <SummaryMessageBubble 
								bubble={bubble} 
								relevantEditBubbles={relevantEditBubbles}
								isLastSummaryForRequest={isLastSummaryForRequest}
								isFirstSummary={isFirstSummary}
							/>;
						}
						console.log("no bubble type", bubble.type);
						return null;
					})
				}
            </div>
        </div>
    );
});

export default ChatTab;
