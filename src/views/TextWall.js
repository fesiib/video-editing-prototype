import React, { useEffect, useMemo, useRef, useState } from "react";

import { observer } from "mobx-react-lite";
import { action, autorun, reaction, when } from "mobx";

import useRootContext from "../hooks/useRootContext";
import { playPositionToFormat } from "../utilities/timelineUtilities";
import { DndContext, DragOverlay, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToFirstScrollableAncestor } from "@dnd-kit/modifiers";
import TrimHandlerLeftIcon from "../icons/TrimHandlerLeftIcon";
import TrimHandlerRightIcon from "../icons/TrimHandlerRightIcon";

const DraggableHandle = observer(function DraggableHandle({ edit, isLeftHandler, isOverlay }) {
	const { uiStore } = useRootContext();
	const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: isOverlay ? `overlay-script-${isLeftHandler ? "left" : "right"}-${edit.commonState.id}`
			: `script-${isLeftHandler ? "left" : "right"}-${edit.commonState.id}`,
		data: {
            type: "script",
            edit,
			isLeftHandler,
        },
        disabled: false,
    });

	const handlerClassName = "z-30 text-s flex";
	return <div
		ref={setNodeRef}
		className={handlerClassName}
		style={{
			// width: `${handlerWidth}px`,
			//transform: CSS.Transform.toString(adjustedTransform),
			opacity: isOverlay ? 0.5 : 1,
			//backgroundColor: "grey",
		}}
		{...listeners} {...attributes}
	> 
		<button className={"w-2 h-7 bg-black rounded"}>
			{/* {" "}{isLeftHandler ? <TrimHandlerLeftIcon /> : <TrimHandlerRightIcon />}{" "} */}
		</button>
	</div>
});

const DraggableParts = observer(function DraggableParts({
	type,
	index,
	item,
	className,
	onDoubleClick,
	isHovering,
}) {
    const { uiStore, domainStore } = useRootContext();

	let parts = [];
	
	if (type === "active") {
		parts = domainStore.curTab.activeEdits.filter((edit) => {
			return (
				(edit.commonState.offset >= item.start && edit.commonState.offset < item.finish)
				|| (edit.commonState.end > item.start && edit.commonState.end < item.finish)
				|| (edit.commonState.offset < item.start && edit.commonState.end >= item.finish)
			);
		});
	}
	return (<>
		{parts.map((edit, idx) => {
			let start = Math.max(item.start, edit.commonState.offset);
			let finish = Math.min(item.finish, edit.commonState.end);
			const left = Math.round((start - item.start) / (item.finish - item.start) * 100);
			const width = Math.floor((finish - start) / (item.finish - item.start) * 100);
			const isLeftEnd = (item.start <= edit.commonState.offset && item.finish > edit.commonState.offset);
			const isRightEnd = (item.start < edit.commonState.end && item.finish >= edit.commonState.end);
			let innerClassName = className + " bg-green-400";
			if (isLeftEnd && isRightEnd) {
				innerClassName += " justify-between items-center";
			}
			else if (isRightEnd) {
				innerClassName += " justify-end items-center";
			}
			else if (isLeftEnd) {
				innerClassName += " justify-start items-center";
			};

			const isSelected = uiStore.timelineControls.selectedTimelineItems.findIndex(
				(selectedItem) => selectedItem.commonState.id === edit.commonState.id) !== -1;

			if (isSelected) {
				innerClassName += " border-y-2 border-red-600 brightness-50";
			}

			return(<div
				key={`draggable-${index}-${edit.commonState.id}`}
				id={`draggable-${index}-${edit.commonState.id}`}
				onDoubleClick={(event) => onDoubleClick(event, edit)}
				className={innerClassName}
				style={{
					borderTopWidth: "2px",
					borderBottomWidth: "2px",
					borderColor: uiStore.editColorPalette[edit.parent.editOperationKey],
					marginLeft: `${left}%`,
					width: `${width}%`,
				}}
			>
				{isLeftEnd ?
					<DraggableHandle 
						edit={edit} 
						isLeftHandler={true}
						isOverlay={false}
					/>
					: null
				}
				{isRightEnd ?
					<DraggableHandle
						edit={edit} 
						isLeftHandler={false}
						isOverlay={false}
					/>
					: null
				}
			</div>);
		})}
	</>);
});

const StaticParts = observer(function StaticParts({
	type,
	index,
	item,
	className,
	onDoubleClick,
}) {
	const { userStore, uiStore, domainStore } = useRootContext();

	let parts = [];

	if (type === "skipped") {
		parts = domainStore.skippedParts.filter((skipped) => {
			return (
				(skipped.commonState.offset >= item.start && skipped.commonState.offset < item.finish)
				|| (skipped.commonState.end > item.start && skipped.commonState.end < item.finish)
				|| (skipped.commonState.offset < item.start && skipped.commonState.end >= item.finish)
			);
		});
	}
	else if (type === "suggested") {
		parts = userStore.systemSetting ? domainStore.curTab.suggestedEdits.filter((edit) => {
			return (
				(edit.commonState.offset >= item.start && edit.commonState.offset < item.finish)
				|| (edit.commonState.end > item.start && edit.commonState.end < item.finish)
				|| (edit.commonState.offset < item.start && edit.commonState.end >= item.finish)
			);
		}) : [];
	}
	// useEffect(() => reaction(() => uiStore.timelineControls.selectedTimelineItems, (selectedItems) => {
	// 	console.log("applying style");
	// 	for (const part of parts) {
	// 		const div = document.getElementById(`static-${index}-${part.commonState.id}`);
	// 		if (div === null) {
	// 			continue;
	// 		}
	// 		const childDiv = div.children[0];
	// 		if (childDiv === null) {
	// 			continue;
	// 		}
	// 		if (selectedItems.findIndex((selectedItem) => selectedItem.commonState.id === part.commonState.id) !== -1) {
	// 			childDiv.className = className + " border-y-2 border-red-600 brightness-50";
	// 		}
	// 		else {
	// 			childDiv.className = className;
	// 		}
	// 	}
	// }), []);

	return (<>
		{parts.map((part) => {
			let start = Math.max(item.start, part.commonState.offset);
			let finish = Math.min(item.finish, part.commonState.end);
			const left = Math.round((start - item.start) / (item.finish - item.start) * 100);
			const width = Math.floor((finish - start) / (item.finish - item.start) * 100);
			const isLeftEnd = (item.start <= part.commonState.offset && item.finish > part.commonState.offset);
			const isRightEnd = (item.start < part.commonState.end && item.finish >= part.commonState.end);
			const isSelected = uiStore.timelineControls.selectedTimelineItems.findIndex(
				(selectedItem) => selectedItem.commonState.id === part.commonState.id) !== -1;
			
			let innerClassName = className;
			if (isLeftEnd && isRightEnd) {
				innerClassName += " justify-between";
			}
			else if (isRightEnd) {
				innerClassName += " justify-end";
			}
			else if (isLeftEnd) {
				innerClassName += " justify-start";
			}
			if (isSelected) {
				innerClassName += " brightness-50";
			}
			return(<div
				key={`static-${index}-${part.commonState.id}`}
				id={`static-${index}-${part.commonState.id}`}
				onDoubleClick={(event) => onDoubleClick(event, part)}
			>
				<div
					className={innerClassName}
					style={{
						borderTopWidth: (type === "skipped" ? "0px" : (
							isSelected ? "3px" : "1px"
						)),
						borderBottomWidth: (type === "skipped" ? "0px" : (
							isSelected ? "3px" : "1px"
						)),
						borderColor: uiStore.editColorPalette[part.parent.editOperationKey],
						marginLeft: `${left}%`,
						width: `${width}%`,
					}}
				> 
				</div>
			</div>);
		})}
	</>);
});

const SentenceBox = observer(function SentenceBox({ 
	index,
	item,
}) {
    const { uiStore, domainStore } = useRootContext();

	const {
        setNodeRef,
    } = useDroppable({
        id: `droppable-script-${index}`,
        data: {
            type: "script",
            item,
        },
		disabled: false,
    });

	const [showTime, setShowTime] = useState(false);

	const onPartDoubleClick = action((event, part) => {
		event.preventDefault();
		event.stopPropagation();
		if (uiStore.timelineControls.rangeSelectingTimeline || uiStore.timelineControls.splitting) {
			return;
		}

		const index = uiStore.timelineControls.selectedTimelineItems.findIndex(
			(value) => value.commonState.id === part.commonState.id
		);
		const isSuggested = part.isSuggested;
		const areItemsSelected = uiStore.timelineControls.selectedTimelineItems.length > 0;
		const areItemsSuggested = areItemsSelected ? uiStore.timelineControls.selectedTimelineItems[0].isSuggested : false;
		const sameTrack = areItemsSelected
			? part.commonState.trackId ===
			  uiStore.timelineControls.selectedTimelineItems[0].commonState.trackId
			: true;
		const metaKey = event.metaKey;
		if (metaKey && areItemsSelected && sameTrack && areItemsSuggested === isSuggested) {
			let newSelectedTimelineItems = [];
			if (index >= 0) {
				const rightMostEnd = part.commonState.end;
				for (let otherScene of uiStore.timelineControls.selectedTimelineItems) {
					if (otherScene.commonState.end < rightMostEnd) {
						newSelectedTimelineItems.push(otherScene);
					}
				}
			} else {
				let leftMostOffset = part.commonState.offset;
				let rightMostEnd = part.commonState.end;
				for (let otherScene of uiStore.timelineControls.selectedTimelineItems) {
					leftMostOffset = Math.min(leftMostOffset, otherScene.commonState.offset);
					rightMostEnd = Math.max(rightMostEnd, otherScene.commonState.end);
				}
				const allParts = isSuggested ?
					domainStore.curTab.suggestedEdits : domainStore.curTab.activeEdits;
				for (let somePart of allParts) {
					if (
						somePart.commonState.offset >= leftMostOffset &&
						somePart.commonState.end <= rightMostEnd
					) {
						newSelectedTimelineItems.push(somePart);
					}
				}
			}
			uiStore.selectTimelineObjects([...newSelectedTimelineItems]);
			uiStore.logData("transcriptBatchSelect", {
				count: newSelectedTimelineItems.length,
			});
		} else {
			if (index >= 0) {
				uiStore.selectTimelineObjects([]);
			} else {
				uiStore.logData("transcriptSingleSelect", null);
				uiStore.selectTimelineObjects([part]);
			}
		}
	});

	const onClick = action((event) => {
		event.preventDefault();
		event.stopPropagation();
		if (uiStore.timelineControls.splitting) {
			console.log(event.target);
			// uiStore.timelineControls.splitting = false;
			// uiStore.timelineControls.positionIndicatorVisibility -= 1;
			// uiStore.resetTempState();
            // const {left, right} = scene.split(uiStore.pxToSec(offsetPx));
			// scene.replaceSelf([left, right]);
			return;
		}
		if (uiStore.timelineControls.rangeSelectingTimeline) {
			let offset = item.start;
			let finish = item.finish;
			for (let edit of domainStore.curTab.activeEdits) {
				if (edit.commonState.offset > offset) {
					finish = Math.min(finish, edit.commonState.offset);
				}
				else {
					offset = Math.max(offset, edit.commonState.end);
				}
			}
			if (finish <= offset) {
				alert("intersects with exsiting edit");
				return;
			}
			domainStore.curTab.addActiveEdit(offset, finish);
			uiStore.timelineControls.rangeSelectingTimeline = false;
			uiStore.timelineControls.rangeSelectingFirstPx = -1;
		}
		else {
			uiStore.logData("transcriptSnippetClicked", {
				start: item.start,
				finish: item.finish,
			});
			uiStore.timelineControls.playPosition = item.start;
		}
	});

	const onMouseEnter = action(() => {
		setShowTime(true);
	});


	const onMouseLeave = action(() => {
		setShowTime(false);
	});

	const outerClassName = ("relative pr-2 my-1");

	const timeClassName = "z-30 absolute -top-2 text-xs";

	const formattedStart = playPositionToFormat(item.start);
	//const formattedFinish = playPositionToFormat(item.finish);

	useEffect(() => {
		const div = document.getElementById(`script-${index}`);
		if (div === null) {
			return;
		}
		const disposer = reaction(() => domainStore.transcriptSelectedIndex, (selectedIndex, prevIndex) => {
			if (selectedIndex === index) {
				div.style.textDecoration = "underline";
				div.style.textDecorationColor = "red";
				div.style.fontWeight = "bold";
				div.style.color = "red";
				div.scrollIntoView({
					behavior: "instant",
					block: "nearest",
					inline: "nearest",
				})
			}
			else {
				div.style.textDecoration = "";
				div.style.textDecorationColor = "";
				div.style.fontWeight = "";
				div.style.color = "black";
			}
		});
		return () => {
			if (div === null) {
				return;
			}
			disposer();
		}
	}, []);

    return (
		<div
			ref={setNodeRef}
			id={"script-" + index}
			className={outerClassName}
			//onDoubleClick={(event) => onDoubleClick(event)}
			onClick={(event) => onClick(event)}
			onMouseEnter={() => onMouseEnter()}
			onMouseLeave={() => onMouseLeave()}
		>	
			<div>
				<div className="relative z-10 text-left">
					{item.text}
				</div>	
			</div>
			<StaticParts
				type="skipped"
				index = {index}
				item = {item}
				className = {"z-0 opacity-100 absolute inset-y-0 bg-gray-500 flex"}
				onDoubleClick={null}
			/>
			<DraggableParts
				type="active"
				index = {index}
				item = {item}
				className = {"z-20 opacity-40 inset-y-0 absolute flex items-end bottom-0"}
				onDoubleClick={onPartDoubleClick}
			/>
			<StaticParts
				type="suggested"
				index = {index}
				item = {item}
				className = {"z-30 opacity-70 absolute hover:inset-y-0 hover:-bottom-1 inset-y-5 bg-yellow-300 flex -bottom-1"}
				onDoubleClick={onPartDoubleClick}
			/>
			{showTime ? (<div className={timeClassName}> {formattedStart} </div>) : null }
		</div>
    );
});

const TextWall = observer(function TextWall() {
    const { uiStore, domainStore } = useRootContext();
    const filteredScript = domainStore.transcripts;

	const textWallRef = useRef(null);

	const [activeHandler, setActiveHandler] = useState(null);

	const onHandlerDragStart = action((event) => {
		const { active } = event;
		setActiveHandler(active);
		return;
	});

	const onHandlerDragEnd = action((event) => {
		const { over } = event;
		const active = activeHandler;
		if (active === null || over === null) {
			return;
		}
		// const item = over.data.current.item;
		// const edit = active.data.current.edit;
		// const isLeftHandler = active.data.current.isLeftHandler;
		// let deltaSeconds = 0;
		// if (isLeftHandler) {
		// 	deltaSeconds = item.start - edit.commonState.offset;
		// 	deltaSeconds = Math.max(
        //         deltaSeconds,
        //         edit.leftTimelineLimit - edit.commonState.offset,
        //         -edit.commonState.start
        //     );
		// 	edit.commonState.setMetadata({
		// 		offset: edit.commonState.offset + deltaSeconds,
		// 		start: edit.commonState.start + deltaSeconds,
		// 	});
		// }
		// else {
		// 	deltaSeconds = item.finish - edit.commonState.end;
		// 	deltaSeconds = Math.max(
		// 		deltaSeconds,
		// 		uiStore.timelineConst.minTimelineItemDuration - edit.commonState.sceneDuration
		// 	);
		// 	deltaSeconds = Math.min(
        //         deltaSeconds,
		// 		edit.rightTimelineLimit - edit.commonState.end,
		//		edit.commonState.duration - edit.commonState.finish
        //     );
		// 	edit.commonState.setMetadata({
		// 		finish: edit.commonState.start + (edit.commonState.finish + deltaSeconds) - edit.commonState.offset,
		// 	});
		// }
		setActiveHandler(null);
		return;
	});

	const onHandlerDragMove = action((event) => {
		const { over } = event;
		const active = activeHandler;
		if (active === null || over === null) {
			return;
		}
		const item = over.data.current.item;
		const edit = active.data.current.edit;
		const isLeftHandler = active.data.current.isLeftHandler;
		let deltaSeconds = 0;
		if (isLeftHandler) {
			deltaSeconds = item.start - edit.commonState.offset;
			deltaSeconds = Math.max(
                deltaSeconds,
                edit.leftTimelineLimit - edit.commonState.offset,
                -edit.commonState.start
            );
			edit.commonState.setMetadata({
				offset: edit.commonState.offset + deltaSeconds,
				start: edit.commonState.start + deltaSeconds,
			});
		}
		else {
			deltaSeconds = item.finish - edit.commonState.end;
			deltaSeconds = Math.max(
				deltaSeconds,
				uiStore.timelineConst.minTimelineItemDuration - edit.commonState.sceneDuration
			);
			deltaSeconds = Math.min(
                deltaSeconds,
				edit.rightTimelineLimit - edit.commonState.end,
                edit.commonState.duration - edit.commonState.finish
            );
			edit.commonState.setMetadata({
				finish: edit.commonState.start + (edit.commonState.finish + deltaSeconds) - edit.commonState.offset,
			});
		}
		uiStore.logData("transcriptEditTrimming", {
			editId: edit.commonState.id,
			sceneDuration: edit.commonState.sceneDuration,
			delta: deltaSeconds,
			isLeftHandler: isLeftHandler,
		});
		return;
    });

	const onTextWallScroll = action((event) => {
		if (textWallRef.current === null
			|| textWallRef.current === undefined
			//|| uiStore.navigation !== "transcript"	
		) {
			return;
		}
		const { top: parentTop, bottom: parentBottom } = textWallRef.current.getBoundingClientRect();
		let l = 0;
		let r = filteredScript.length;
		while (l < r) {
			const mid = Math.floor((l + r) / 2);
			const scriptDiv = document.getElementById(`script-${mid}`);
			if (scriptDiv === null || scriptDiv === undefined) {
				console.log('could not find script');
				r = mid;
				continue;
			}
			const scriptRect = scriptDiv.getBoundingClientRect();
			if (scriptRect.bottom < parentTop) {
				l = mid + 1;
			}
			else if (scriptRect.top > parentBottom) {
				r = mid;
			}
			else {
				r = mid;
			}
		}
		uiStore.commandSpaceControls.viewPortAuthor = "other";
		const startScriptPos = l;
		if (startScriptPos === filteredScript.length) {
			uiStore.commandSpaceControls.viewPortStart = domainStore.projectMetadata.duration;
			uiStore.commandSpaceControls.viewPortFinish = domainStore.projectMetadata.duration;
			return;
		}
		uiStore.commandSpaceControls.viewPortStart = filteredScript[startScriptPos].start;
		l = startScriptPos;
		r = filteredScript.length;
		while (l < r) {
			const mid = Math.floor((l + r) / 2);
			const scriptDiv = document.getElementById(`script-${mid}`);
			if (scriptDiv === null || scriptDiv === undefined) {
				console.log('could not find script');
				r = mid;
				continue;
			}
			const scriptRect = scriptDiv.getBoundingClientRect();
			if (scriptRect.bottom < parentBottom) {
				l = mid + 1;
			}
			else if (scriptRect.top > parentBottom) {
				r = mid;
			}
			else {
				l = mid + 1;
			}
		}
		const finishScriptPos = l;
		if (finishScriptPos === filteredScript.length) {
			uiStore.commandSpaceControls.viewPortFinish = domainStore.projectMetadata.duration;
			return;
		}
		uiStore.commandSpaceControls.viewPortFinish = filteredScript[finishScriptPos].start;
	});

	useEffect(action(() => {
		//onTextWallScroll(null);
	}), [
		filteredScript.length,
		uiStore.navigation,
		textWallRef.current,
	]);

	useEffect(() => {
		if (textWallRef.current === null || textWallRef.current === undefined
			|| filteredScript.length == 0) {
			return;
		}
		const disposal = reaction(() => uiStore.commandSpaceControls.viewPortStart, (targetStart) => {
			if (uiStore.commandSpaceControls.viewPortAuthor !== "timeline") {
				return;
			}
			let l = 0;
			let r = filteredScript.length;
			while (l < r) {
				const mid = Math.floor((l + r) / 2);
				if (filteredScript[mid].start < targetStart) {
					l = mid + 1;
				}
				else {
					r = mid;
				}
			}
			if (l === filteredScript.length) {
				l = filteredScript.length - 1;
			}
			const scriptDiv = document.getElementById(`script-${l}`);
			if (scriptDiv === null || scriptDiv === undefined) {
				console.log('could not find script');
				return;
			}
			scriptDiv.scrollIntoView({
				behavior: "instant",
				block: "start",
				inline: "nearest",
			});
		});	
		return () => {
			disposal();
		};
	}, [
		textWallRef.current,
		filteredScript.length,
	]);

    return (
        <div 
			ref={textWallRef}
			className="overflow-y-scroll overflow-x-visible disable-select w-full max-h-72 px-2 bg-gray-100 border"
			style={{
                height: uiStore.windowSize.height / 3 * 2
			}}
			//onScroll={(event) => onTextWallScroll(event)}
		>
			<DndContext
				sensors={useSensors(
                    useSensor(PointerSensor)
                )}
				modifiers={[restrictToFirstScrollableAncestor]}
				onDragStart={onHandlerDragStart}
				onDragEnd={onHandlerDragEnd}
				onDragMove={onHandlerDragMove}
			>
				{filteredScript.length === 0 ? (
					<div className="text-red"> No Script... </div>
				) : (
					<div className="flex flex-wrap ">
						{filteredScript.map((item, index) => {
							return (<SentenceBox 
								key={`script-${index}`}
								index={index}
								item={item}
							/>);
						})}
					</div>
				)}
				<DragOverlay
                    modifiers={!!activeHandler ? [] : []}
                    dropAnimation={null}
                >
					{!!activeHandler ? (
						<DraggableHandle 
							edit={activeHandler.data.current.edit} 
							isLeftHandler={activeHandler.data.current.isLeftHandler}
							marginLeft={0}
							isOverlay={true}
						/>
					): null}
				</DragOverlay>
			</DndContext>
        </div>
    );
});


export default TextWall;