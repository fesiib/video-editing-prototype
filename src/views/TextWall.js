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
	const limit = isLeftHandler ? edit.leftTimelineLimit : edit.rightTimelineLimit;
	const { attributes, listeners, setNodeRef } = useDraggable({
        id: isOverlay ? `overlay-script-${isLeftHandler ? "left" : "right"}-${edit.commonState.id}`
			: `script-${isLeftHandler ? "left" : "right"}-${edit.commonState.id}`,
		data: {
            type: "script",
            edit,
			isLeftHandler,
			limit,
        },
        disabled: false,
    });

	const handlerClassName = "z-30 text-s";
	return <div
		ref={setNodeRef}
		className={handlerClassName}
		style={{
			height: "100%",
			// width: `${handlerWidth}px`,
			//transform: CSS.Transform.toString(adjustedTransform),
			opacity: isOverlay ? 0.5 : 1,
			backgroundColor: "grey",
		}}
		{...listeners} {...attributes}
	> 
		<button className="my-auto">
			{" "} {isLeftHandler ? <TrimHandlerLeftIcon /> : <TrimHandlerRightIcon />}{" "}
		</button>
	</div>
});

const DraggableParts = observer(function DraggableParts({
	parts,
	index,
	item,
	className,
	onDoubleClick,
}) {
    const { uiStore } = useRootContext();

	// useEffect(() => reaction(() => {
	// 	return {
	// 		//partsOffsets: parts.map((part) => part.commonState.offset),
	// 		partsEnds: parts.map((part) => part.commonState.end),
	// 		selectedItems: uiStore.timelineControls.selectedTimelineItems
	// 	};
	// }, ({ selectedItems }) => {
	// 	for (const part of parts) {
	// 		const div = document.getElementById(`draggable-${index}-${part.commonState.id}`);
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
	// }), [parts.length]);

	return (<>
		{parts.map((edit, idx) => {
			let start = Math.max(item.start, edit.commonState.offset);
			let finish = Math.min(item.finish, edit.commonState.end);
			const left = Math.round((start - item.start) / (item.finish - item.start) * 100);
			const width = Math.floor((finish - start) / (item.finish - item.start) * 100);
			const isLeftEnd = (item.start <= edit.commonState.offset && item.finish > edit.commonState.offset);
			const isRightEnd = (item.start < edit.commonState.end && item.finish >= edit.commonState.end);
			let innerClassName = className;
			if (isLeftEnd && isRightEnd) {
				innerClassName += " justify-between";
			}
			else if (isRightEnd) {
				innerClassName += " justify-end";
			}
			else if (isLeftEnd) {
				innerClassName += " justify-start";
			};

			if (uiStore.timelineControls.selectedTimelineItems.findIndex(
				(selectedItem) => selectedItem.commonState.id === edit.commonState.id) !== -1
			) {
				innerClassName += " border-y-2 border-red-600 brightness-50";
			}

			return(<div
				key={`draggable-${index}-${edit.commonState.id}`}
				id={`draggable-${index}-${edit.commonState.id}`}
				onDoubleClick={(event) => onDoubleClick(event, edit)}
			>
				<div
					className={innerClassName}
					style={{
						backgroundColor: uiStore.editColorPalette[edit.intent.editOperationKey],
						marginLeft: `${left}%`,
						width: `${width}%`,
					}}
					//onClick={(event) => handleEditClick(event, edit)}
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
				</div>
			</div>);
		})}
	</>);
});

const StaticParts = observer(function StaticParts({
	parts,
	index,
	item,
	className,
	onDoubleClick,
}) {
	const { uiStore } = useRootContext();

	useEffect(() => reaction(() => uiStore.timelineControls.selectedTimelineItems, (selectedItems) => {
		for (const part of parts) {
			const div = document.getElementById(`static-${index}-${part.commonState.id}`);
			if (div === null) {
				continue;
			}
			const childDiv = div.children[0];
			if (childDiv === null) {
				continue;
			}
			if (selectedItems.findIndex((selectedItem) => selectedItem.commonState.id === part.commonState.id) !== -1) {
				childDiv.className = className + " border-y-2 border-red-600 brightness-50";
			}
			else {
				childDiv.className = className;
			}
		}
	}), []);

	return (<>
		{parts.map((part) => {
			let start = Math.max(item.start, part.commonState.offset);
			let finish = Math.min(item.finish, part.commonState.end);
			const left = Math.round((start - item.start) / (item.finish - item.start) * 100);
			const width = Math.floor((finish - start) / (item.finish - item.start) * 100);
			const isLeftEnd = (item.start <= part.commonState.offset && item.finish > part.commonState.offset);
			const isRightEnd = (item.start < part.commonState.end && item.finish >= part.commonState.end);
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
			return(<div
				key={`static-${index}-${part.commonState.id}`}
				id={`static-${index}-${part.commonState.id}`}
				onDoubleClick={(event) => onDoubleClick(event, part)}
			>
				<div
					className={innerClassName}
					style={{
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
	activeEdits,
	suggestedEdits,
	skippedParts,
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
		if (uiStore.timelineControls.rangeSelectingTimeline) {
			uiStore.timelineControls.rangeSelectingTimeline = false;
			uiStore.timelineControls.rangeSelectingFirstPx = -1;
			uiStore.timelineControls.positionIndicatorVisibility -= 1;
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
					domainStore.curIntent.suggestedEdits : domainStore.curIntent.activeEdits;
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
		} else {
			if (index >= 0) {
				uiStore.selectTimelineObjects([]);
			} else {
				uiStore.selectTimelineObjects([part]);
			}
		}
	});

	const onClick = action((event) => {
		event.preventDefault();
		event.stopPropagation();
		if (uiStore.timelineControls.rangeSelectingTimeline === true) {
			let offset = item.start;
			let finish = item.finish;
			for (let edit of activeEdits) {
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
			domainStore.curIntent.addActiveEdit(offset, finish);
			uiStore.timelineControls.rangeSelectingTimeline = false;
			uiStore.timelineControls.rangeSelectingFirstPx = -1;
		}
		else {
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
				parts = {skippedParts}
				index = {index}
				item = {item}
				className = {"z-0 opacity-100 absolute inset-y-0 bg-gray-500 flex"}
				onDoubleClick={null}
			/>
			<DraggableParts
				parts = {activeEdits}
				index = {index}
				item = {item}
				className = {"z-20 opacity-40 inset-y-0 absolute flex"}
				onDoubleClick={onPartDoubleClick}
			/>
			<StaticParts
				parts = {suggestedEdits}
				index = {index}
				item = {item}
				className = {"z-30 opacity-40 absolute inset-y-0 bg-green-500 flex"}
				onDoubleClick={onPartDoubleClick}
			/>
			{showTime ? (<div className={timeClassName}> {formattedStart} </div>) : null }
		</div>
    );
});

const TextWall = observer(function TextWall() {
    const { uiStore, domainStore } = useRootContext();
    const filteredScript = domainStore.transcripts;

	const activeEdits = domainStore.curIntent.activeEdits;
	const suggestedEdits = uiStore.systemSetting ? domainStore.curIntent.suggestedEdits : [];
	const skippedParts = domainStore.skippedParts;

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
		const item = over.data.current.item;
		const edit = active.data.current.edit;
		const isLeftHandler = active.data.current.isLeftHandler;
		const limit = active.data.current.limit;
		if (isLeftHandler) {
			const updatedStart = Math.max(limit, Math.min(item.start, edit.commonState.finish));
			edit.commonState.offset = updatedStart;
			edit.commonState.start = updatedStart;
		}
		else {
			const updatedFinish = Math.min(limit, Math.max(item.finish, edit.commonState.offset))
			edit.commonState.finish = updatedFinish;	
		}
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
		const limit = active.data.current.limit;
		if (isLeftHandler) {
			const updatedStart = Math.max(limit, Math.min(item.start, edit.commonState.finish));
			edit.commonState.offset = updatedStart;
			edit.commonState.start = updatedStart;
		}
		else {
			const updatedFinish = Math.min(limit, Math.max(item.finish, edit.commonState.offset))
			edit.commonState.finish = updatedFinish;	
		}
		return;
    });

    return (
        <div 
			ref={textWallRef}
			className="overflow-y-scroll overflow-x-visible disable-select p-10"
			style={{
                height: uiStore.windowSize.height / 3 * 2
			}}
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
							const relevantActiveEdits = activeEdits.filter((edit) => {
								return (
									(edit.commonState.offset >= item.start && edit.commonState.offset < item.finish)
									|| (edit.commonState.end > item.start && edit.commonState.end < item.finish)
									|| (edit.commonState.offset < item.start && edit.commonState.end >= item.finish)
								);
							});
							const relevantSuggestedEdits = suggestedEdits.filter((edit) => {
								return (
									(edit.commonState.offset >= item.start && edit.commonState.offset < item.finish)
									|| (edit.commonState.end > item.start && edit.commonState.end < item.finish)
									|| (edit.commonState.offset < item.start && edit.commonState.end >= item.finish)
								);
							});
							const relevantSkippedParts = skippedParts.filter((skipped) => {
								return (
									(skipped.commonState.offset >= item.start && skipped.commonState.offset < item.finish)
									|| (skipped.commonState.end > item.start && skipped.commonState.end < item.finish)
									|| (skipped.commonState.offset < item.start && skipped.commonState.end >= item.finish)
								);
							});
							return (<SentenceBox 
								key={`script-${index}`}
								index={index}
								item={item}
								activeEdits={relevantActiveEdits}
								suggestedEdits={relevantSuggestedEdits}
								skippedParts={relevantSkippedParts}
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