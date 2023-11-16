import React, { useState } from "react";
import { observer } from "mobx-react-lite";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faCheck, faSpinner } from "@fortawesome/free-solid-svg-icons";
import CheckIcon from "@mui/icons-material/Check";
import ToggleButton from "@mui/material/ToggleButton";

import SnapshotImg from "../snapshot_example.png";

import CommandSpace from "./CommandSpace";

import useRootContext from "../hooks/useRootContext";
import { action } from "mobx";

const UserCommandBubble = observer(function UserCommandBubble({ bubble }) {
	const { userStore, uiStore, domainStore } = useRootContext();
	const content = bubble.content;
	const time = new Date(bubble.time).toLocaleTimeString("en-US", {
		hour12: false,
		hour: "numeric",
		minute: "numeric",
	});
	return (<div className="mb-3 text-left">
		<div className="bg-slate-200 w-auto px-2 py-1 ml-20 mt-1 rounded-md">
			<div className="text-xs text-right">
				{time}
			</div>
			<div className="text-m">
				{content}
			</div>
		</div>
	</div>);
});

const ParsingResultBubble = observer(function ParsingResultBubble({ bubble }) {
	const { userStore, uiStore, domainStore } = useRootContext();

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


	return (<div className="mb-3">
		<div className="bg-slate-200 w-auto px-2 py-1 mr-10 mt-1 rounded-md">
			<div className="text-xs text-left">
				{time}
			</div>
			<div className="italic">
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
			<div
				className="text-xs text-left"
			>
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
		</div>
	</div>);
});

const EditBubble = observer(function EditBubble({ bubble }) {
	const { userStore, uiStore, domainStore } = useRootContext();

	const setToggle = action((event) => {
		//TODO: add edit or not
		bubble.setToggle(!bubble.toggle);
	});

	const content = bubble.content;
	const time = new Date(bubble.time).toLocaleTimeString("en-US", {
		hour12: false,
		hour: "numeric",
		minute: "numeric",
	});
	const toggle = bubble.toggle;
	return (<div className="mb-3">
		<div className="flex flex-row items-center">
			<button
				className={`w-5 h-5 mr-2 rounded-full border border-black flex items-center justify-center focus:outline-none ${
					toggle ? "bg-black text-white" : ""
				}`}
				onClick={setToggle}
			>
				{toggle && <FontAwesomeIcon icon={faCheck} />}
			</button>
			<div className="font-semibold hover:cursor-pointer" onClick={setToggle}>
				Edit # TODO
			</div>
		</div>
		<div
			className={`mt-1 bg-slate-200 w-96 h-56 pl-5 pt-2 rounded-md hover:cursor-pointer ${
				toggle ? "border-2 border-black" : ""
			}`}
			onClick={setToggle}
		>
			<div className="text-xs text-left">
				{time}
			</div>
			<div className="italic">
				{content}
			</div>
			{/* TODO: update image */}
			<img src={SnapshotImg} alt="snapshot" width="280" />
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
	return (<div className="mb-3">
		<div className="text-xs text-left">
			{time}
		</div>
		<div className="bg-slate-200 w-auto px-2 py-1 mr-10 mt-1 rounded-md">
			{content}
		</div>
	</div>);
});

const SummaryMessageBubble = observer(function SummaryMessageBubble({ bubble }) {
	const { userStore, uiStore, domainStore } = useRootContext();

	const setToggle = action((event) => {
		//TODO: add all edits or not
		bubble.setToggle(!bubble.toggle);
	});

	const content = bubble.content;
	const time = new Date(bubble.time).toLocaleTimeString("en-US", {
		hour12: false,
		hour: "numeric",
		minute: "numeric",
	});
	const toggle = bubble.toggle;
	return (<div className="mb-3">
		<div className="font-semibold">
			Summary of Edits
		</div>
		<div className="bg-slate-200 w-auto px-2 py-1 mr-10 mt-1 rounded-md">
			<div className="text-xs text-left">
				{time}
			</div>
			{content}
			<div className="mb-3 flex flex-row items-center">({"  "}
				<button
					className={`w-4 h-4 mr-1 border border-black flex items-center justify-center focus:outline-none ${
						toggle ? "bg-black text-white" : ""
					}`}
					onClick={setToggle}
				>
					{toggle && <FontAwesomeIcon icon={faCheck} />}
				</button>
				{!toggle ? "Select All" : "Deselect All"})
			</div>
		</div>
	</div>);
});

const ChatTab = observer(function ChatTab() {
	const { userStore, uiStore, domainStore } = useRootContext();

	const curTab = domainStore.curTab;

	const timeOrderedBubbles = curTab.timeOrderedBubbles;

    return (
        <div>
            <div>✨ Describe edits you want to implement!</div>
			<CommandSpace />
            <div className="overflow-auto mt-3" style={{ maxHeight: "720px" }}>
				{
					timeOrderedBubbles.map((bubble) => {
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
							return <EditBubble bubble={bubble} />;
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
						</div>
					) : (null)
				}

            </div>
        </div>
    );
});

export default ChatTab;
