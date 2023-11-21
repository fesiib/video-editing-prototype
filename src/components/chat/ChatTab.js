import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowAltCircleDown, faArrowUp, faArrowUp19, faCamera, faCancel, faCaretDown, faCaretRight, faCheck, faCross, faExpand, faExpandArrowsAlt, faInfoCircle, faPlus, faSpinner, faX, faXmark } from "@fortawesome/free-solid-svg-icons";
import CheckIcon from "@mui/icons-material/Check";
import ToggleButton from "@mui/material/ToggleButton";

import SnapshotImg from "../../snapshot_example.png";

import CommandSpace from "../../views/CommandSpace";
import ChatEditPreview from "./ChatEditPreview";

import useRootContext from "../../hooks/useRootContext";
import { action, toJS } from "mobx";
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
		parsingResultStarts.push(range[0]);
		parsingResultStarts.push(range[1]);
	}
	parsingResultStarts.sort((a, b) => a - b);


	return (<div className="mb-3 w-fit">
		<div className="text-xs text-left">
			{time}
		</div>
		<div className="bg-slate-200 w-auto p-2 mr-10 mt-1 rounded-md">
			<div className="font-semibold">
				{content}
			</div>
			<div>
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
							if (range[0] <= start && end <= range[1]) {
								backgroundTransparency = 0.3;
								rgb[0] = 255;
							}
						}
						for (let range of bubble.parsingResult.spatial) {
							if (range[0] <= start && end <= range[1]) {
								backgroundTransparency = 0.3;
								rgb[1] = 255;
							}
						}
						for (let range of bubble.parsingResult.edit) {
							if (range[0] <= start && end <= range[1]) {
								backgroundTransparency = 0.3;
								rgb[2] = 255;
							}
						}
						return (<span
							key={`parsing-result-${start}-${end}`}
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
				>
					<FontAwesomeIcon
						icon={isExplanationOpen ? faCaretDown : faCaretRight}
						className="mx-1"
					/>
					<span className="italic"> Breakdown </span>
				</button>
				{
					isExplanationOpen ? (
						<div>
							<div> Temporal: {bubble.parsingResult.temporal.map(
								(range) => range.join("-")
							).join("; ")} </div>
							<div> Spatial: {bubble.parsingResult.spatial.map(
								(range) => range.join("-")
							).join("; ")} </div>
							<div> Edit: {bubble.parsingResult.edit.map(
								(range) => range.join("-")
							).join("; ")} </div>
							<div> Parameters: {bubble.parsingResult.custom.map(
								(range) => range.join("-")
							).join("; ")} </div>
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

const EditBubble = observer(function EditBubble({ bubble, editIdx }) {
	const { userStore, uiStore, domainStore } = useRootContext();
	
	const [isExplanationOpen, setIsExplanationOpen] = useState(false);

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

	return (<div className="mb-3 w-fit">
		<div className="text-xs text-left">
			{time}
		</div>
		<div
			className={`bg-slate-200 h-fit p-2 rounded-md hover:cursor-pointer ${
				toggle ? "border-2 border-indigo-300" : ""
			}`}
		>
			<div className="">
				{content}
			</div>
			{/* TODO: update image */}
			{edit !== null ? (<>
				<div className="flex flex-row items-center">
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
					>
						<FontAwesomeIcon
							icon={isExplanationOpen ? faCaretDown : faCaretRight}
							className="mx-1"
						/>
						<span className="italic"> Explanation </span>
					</button>
					{
						isExplanationOpen ? (
							<div>
								{edit.explanation.map((explanation, idx) => {
									const label = idx === 0 ? "Time Segment" : "Frame Position";
									if (explanation === "") {
										return null;
									}
									return (<div key={`explanation-${idx}`} className="text-s">
										<span className="italic">
											{label}:
										</span>
										{" "}
										<span>
											{explanation}
										</span>
									</div>);
								})}
							</div>
						) : (null)
					}
				</div>
				<div
					onClick={setToggle}
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

const SummaryMessageBubble = observer(function SummaryMessageBubble({ bubble }) {
	const { userStore, uiStore, domainStore } = useRootContext();

	const curTab = domainStore.curTab;
	const bubbles = curTab.timeOrderedBubbles;

	const setToggle = action((event) => {
		let addedEdits = [];
		for (let otherBubble of bubbles) {
			if (otherBubble.id === bubble.id) {
				continue;
			}
			if (otherBubble.requestId !== bubble.requestId) {
				continue;
			}
			if (otherBubble.type === domainStore.bubbleTypes.edit
				&& otherBubble.processed === true
				&& otherBubble.toggle === bubble.toggle
			) {
				const edits = otherBubble.setToggle(!otherBubble.toggle);
				addedEdits = addedEdits.concat(edits);
			}
			if (otherBubble.type === domainStore.bubbleTypes.summaryMessage
				&& otherBubble.processed === true
				&& otherBubble.toggle === bubble.toggle
			) {
				otherBubble.setToggle(!otherBubble.toggle);
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

	const content = bubble.content;
	const time = new Date(bubble.time).toLocaleTimeString("en-US", {
		hour12: false,
		hour: "numeric",
		minute: "numeric",
	});
	const toggle = bubble.toggle;

	return (<div className="mb-3 w-fit h-fit">
		<div className="text-xs text-left">
			{time}
		</div>
		<div className="bg-slate-200 w-auto p-2 mr-10 mt-1 rounded-md">
			<div className="font-semibold">
				Summary of Edits
			</div>
			{content}
			<div className="mb-3 flex flex-row items-center">
				({"  "}
				<button
					className={`w-4 h-4 mr-1 border border-black flex items-center justify-center focus:outline-none ${
						toggle ? "bg-indigo-300 text-black" : ""
					}`}
					onClick={setToggle}
				>
					{toggle && <FontAwesomeIcon icon={faCheck} />}
				</button>
				{!toggle ? "Select All" : "Deselect All"})
			</div>
			<div>
				<button
					className={"w-fit h-fit bg-indigo-200 text-black p-1 rounded hover:bg-indigo-300"}
					onClick={requestMore}
				>
					<FontAwesomeIcon icon={faPlus} className="mr-1" />
					Get More Edits
				</button>
			</div>
		</div>
	</div>);
});

const ChatTab = observer(function ChatTab() {
	const { userStore, uiStore, domainStore } = useRootContext();

	const curTab = domainStore.curTab;

	const timeOrderedBubbles = [...curTab.timeOrderedBubbles].reverse();

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

	useEffect(() => {
		const chatTab = document.getElementById("chat-tab");
		// when chatTab is at the top, scroll to the top
		if (chatTab && chatTab.scrollHeight > chatTab.clientHeight) {
			chatTab.scrollTop = 0;
			setShowScrollUp(false);
		}
	}, [
		timeOrderedBubbles.length,
		curTab.id,
	])

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
							let editIdx = 0;
							for (let i = idx + 1; i < timeOrderedBubbles.length; i++) {
								if (timeOrderedBubbles[i].requestId !== bubble.requestId) {
									break;
								}
								if (timeOrderedBubbles[i].type === domainStore.bubbleTypes.edit
									&& timeOrderedBubbles[i].processed === true
								) {
									editIdx += 1;
								}
							}
							return <EditBubble bubble={bubble} editIdx={editIdx} />;
						}
						if (bubble.type === domainStore.bubbleTypes.systemMessage) {
							return <SystemMessageBubble bubble={bubble} />;
						}
						if (bubble.type === domainStore.bubbleTypes.summaryMessage) {
							return <SummaryMessageBubble bubble={bubble} />;
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
