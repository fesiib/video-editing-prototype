import React, { useEffect, useState } from "react";

import { action, toJS } from "mobx";
import { observer } from "mobx-react-lite";

import TimelineTracks from "../components/timeline/TimelineTracks";

import useRootContext from "../hooks/useRootContext";
import { roundNumber } from "../utilities/genericUtilities";
import ScissorsIcon from "../icons/ScissorsIcon";
import TrashcanIcon from "../icons/TrashcanIcon";
import PauseIcon from "../icons/PauseIcon";
import PlayIcon from "../icons/PlayIcon";
import PlusIcon from "../icons/PlusIcon";
import CheckIcon from "../icons/CheckIcon";
import CrossIcon from "../icons/CrossIcon";
import CopyIcon from "../icons/CopyIcon";

import { TfiSplitH } from "react-icons/tfi";
import { FaSearch } from "react-icons/fa";
import { BsFillSkipBackwardFill } from "react-icons/bs";
import { BsFillSkipForwardFill } from "react-icons/bs";

import { playPositionToFormat } from "../utilities/timelineUtilities";

const Timeline = observer(function Timeline() {
    const { uiStore, domainStore } = useRootContext();
	const curIntent = domainStore.curIntent;

	// const selectedSuggestedEdits = curIntent.suggestedEdits.filter((edit) => {
	// 	return uiStore.timelineControls.selectedTimelineItems.findIndex((item) => {
	// 		return item.commonState.id === edit.commonState.id;
	// 	}) >= 0;
	// });

	const selectedSuggestedEdits = uiStore.timelineControls.selectedTimelineItems.filter((item) => {
		return item.isSuggested;
	});

	selectedSuggestedEdits.sort((a, b) => {
		return a.commonState.offset - b.commonState.offset;
	});

    const onZoomChange = action((event) => {
		// 0 -> minPxToSec
		// 100 -> maxPxToSec
		// value * (maxPxToSec - minPxToSec) / 100 + minPxToSec
		const beforeLeftMarginPx = uiStore.secToPx(
			uiStore.timelineControls.playPosition - uiStore.commandSpaceControls.viewPortStart
		);
        
		uiStore.timelineControls.pxPerSec = uiStore.adaptZoomValue(event.target.value);
		const afterPlayPositionPx = uiStore.secToPx(uiStore.timelineControls.playPosition);
		uiStore.commandSpaceControls.viewPortStart = Math.max(0,
			uiStore.pxToSec(afterPlayPositionPx - beforeLeftMarginPx));
		uiStore.commandSpaceControls.viewPortFinish = Math.min(domainStore.projectMetadata.duration,
			uiStore.commandSpaceControls.viewPortStart + uiStore.pxToSec(uiStore.timelineSize.width));
		uiStore.commandSpaceControls.viewPortAuthor = "zoom";
		uiStore.logData("timelineZoomChange", {
			viewPortStart: uiStore.commandSpaceControls.viewPortStart,
			viewPortFinish: uiStore.commandSpaceControls.viewPortFinish,
			value: event.target.value,
		});
    });

    const onPressPlay = action((event) => {
		event.preventDefault();
		event.stopPropagation();
        uiStore.timelineControls.isPlaying = !uiStore.timelineControls.isPlaying;
		uiStore.logData("play", {
			playing: uiStore.timelineControls.isPlaying,
		});
    });

    const onPressSplit = action((event) => {
        event.preventDefault();
        event.stopPropagation();
		uiStore.timelineControls.rangeSelectingTimeline = false;
		uiStore.timelineControls.rangeSelectingFirstPx = -1;
		uiStore.timelineControls.splitting = !uiStore.timelineControls.splitting;
		uiStore.logData("timelineSplit", {
			splitting: uiStore.timelineControls.splitting,
		});
    });

	const onPressRangeSelect = action((event) => {
        event.preventDefault();
        event.stopPropagation();
        uiStore.timelineControls.splitting = false;
		let offset = uiStore.timelineControls.playPosition;

		let newOffset = uiStore.timelineControls.playPosition;
		let newFinish = domainStore.projectMetadata.duration;

		const sortedScenes = [...curIntent.activeEdits].sort((a, b) => {
			return a.commonState.offset - b.commonState.offset;
		});
		
		for (let otherScene of sortedScenes) {
			if (otherScene.commonState.end < newOffset) {
				continue;
			}
			if (otherScene.commonState.offset > newOffset) {
				newFinish = otherScene.commonState.offset;
				break;
			}
			newOffset = otherScene.commonState.end;
		}

		newFinish = Math.min(newFinish, newOffset + 10)
		uiStore.logData("timelineAddSegment", {
			offset: newOffset,
			finish: newFinish,
			success: newOffset < newFinish,
		});
		if (newOffset >= newFinish) {
			alert("Cannot add any segment. No space left.");
			return;
		}
		const newScene = curIntent.addActiveEdit(
			newOffset, newFinish,
		);	
		uiStore.timelineControls.playPosition = newOffset;
		uiStore.selectTimelineObjects([newScene]);
    });


    const onDeleteTimelineItems = action(() => {
		if (window.confirm("Delete selected segments? You cannot restore deleted segments ") === false) {
			return;
		}
        const selectedSceneIds = uiStore.timelineControls.selectedTimelineItems.map(
            (value) => value.commonState.id
        );
		uiStore.logData("timelineDelete", {
			selectedSceneIds: selectedSceneIds,
		});
        curIntent.deleteEdits(selectedSceneIds);
		uiStore.selectTimelineObjects([]);
    });

	const onCopyPasteTimelineItems = action(() => {
		if (selectedSuggestedEdits.length > 0) {
			return;
		}
		const selectedSceneIds = uiStore.timelineControls.selectedTimelineItems.map(
			(value) => value.commonState.id
		);
		if (selectedSceneIds.length !== 1) {
			return;
		}
		const selectedScenes = curIntent.activeEdits.filter((edit) => {
			return selectedSceneIds.findIndex((id) => id === edit.commonState.id) >= 0;
		});
		const newScenes = selectedScenes.map(action((scene) => {
			const newScene = scene.getDeepCopy();
			let newOffset = scene.commonState.offset + scene.commonState.sceneDuration;
			let newFinish = domainStore.projectMetadata.duration;

			const sortedScenes = [...curIntent.activeEdits].sort((a, b) => {
				return a.commonState.offset - b.commonState.offset;
			});
			
			for (let otherScene of sortedScenes) {
				if (otherScene.commonState.end < newOffset) {
					continue;
				}
				if (otherScene.commonState.offset > newOffset) {
					newFinish = otherScene.commonState.offset;
					break;
				}
				newOffset = otherScene.commonState.end;
			}

			newFinish = Math.min(newFinish, newOffset + scene.commonState.sceneDuration)
			uiStore.logData("timelineDuplicate", {
				selectedSceneIds: selectedSceneIds,
				offset: newOffset,
				finish: newFinish,
				success: newOffset < newFinish,
			});
			if (newOffset >= newFinish) {
				alert("Cannot duplicate this segment. No space left.");
				return null;
			}
			newScene.commonState.setMetadata({
				offset: newOffset,
				start: newOffset,
				finish: newFinish,
			});
			curIntent.activeEdits.push(newScene);
			uiStore.timelineControls.playPosition = newOffset;
			return newScene;
		}));
		uiStore.selectTimelineObjects(newScenes.filter((scene) => scene !== null));
	});

    const onKeyDown = action((event) => {
		uiStore.logData("timelineKey", {
			which: event.which,
		});
        if (event.which === 46 || event.which === 8 || event.which === 68) {
            ///delete key or backspace key or d key
            onDeleteTimelineItems();
        }
		if (event.which === 67 && event.metaKey) {
			///paste key
			onCopyPasteTimelineItems();
		}
		if (event.which === 32) {
			///space key
			onPressPlay(event);
		}
		// if (event.which === 83) {
		// 	///s key
		// 	onPressSplit(event);
		// }
		if (event.which === 65) {
			///a key
			onPressRangeSelect(event);
		}
		if (event.which === 37) {
			///left arrow key
			onNavigationClick("prev");
		}
		if (event.which === 39) {
			///right arrow key 
			onNavigationClick("next");
		}
		if (event.which === 38) {
			///up arrow key
			onZoomChange({
				target: {
					value: Math.min(100, uiStore.adaptPxPerSec(uiStore.timelineControls.pxPerSec) + 5),
				}
			});
		}
		if (event.which === 40) {
			///down arrow key
			onZoomChange({
				target: {
					value: Math.max(0, uiStore.adaptPxPerSec(uiStore.timelineControls.pxPerSec) - 5),
				}
			});
		}
    });

	const onDecisionClick = action((decision) => {
		if (decision === "accept") {
			let addedEdits = [];
			for (const edit of selectedSuggestedEdits) {
				addedEdits.push(curIntent.addEditFromSuggested(edit.commonState.id));
			}
			const deleteEditIds = selectedSuggestedEdits.map((edit) => edit.commonState.id);
			uiStore.logData("timelineDecisionAccept", {
				deletedEdits: deleteEditIds,
				addedEdits: addedEdits.map((edit) => edit.commonState.id),
			});
			curIntent.deleteEdits(deleteEditIds);
			uiStore.selectTimelineObjects(addedEdits);
			return;
		}
		else if (decision === "reject") {
			const deleteEditIds = selectedSuggestedEdits.map((edit) => edit.commonState.id);
			uiStore.logData("timelineDecisionReject", {
				deletedEdits: deleteEditIds,
			});
			curIntent.deleteEdits(deleteEditIds);
			if (!onNavigationClick("next") && curIntent.suggestedEdits.length > 0) {
				onNavigationClick("prev");
			}
			return;
		}
	});

	const onMoreClick = action(() => {
		if (curIntent.processingAllowed && curIntent.searchMoreAllowed) {
			domainStore.processIntent(
				domainStore.processingModes.addMore,
				{
					start: uiStore.commandSpaceControls.viewPortStart,
					finish: uiStore.commandSpaceControls.viewPortFinish,
				}
			);
			uiStore.logData("timelineSearchMore", {
				text: curIntent.textCommand,
				sketch: toJS(curIntent.sketchCommand),
				sketchTimestamp: curIntent.sketchPlayPosition,
				mode: domainStore.processingModes.addMore,
				start: uiStore.commandSpaceControls.viewPortStart,
				finish: uiStore.commandSpaceControls.viewPortFinish,
			});
		}
	});

	const onNavigationClick = action((direction) => {
		const edits = (curIntent.suggestedEdits.length > 0 ?
			curIntent.suggestedEdits : curIntent.activeEdits);

		if (edits.length > 0 && uiStore.timelineControls.selectedTimelineItems.length === 0) {
			for (let edit of edits) {
				if (edit.commonState.offset === uiStore.timelineControls.playPosition) {
					uiStore.selectTimelineObjects([edit]);
					return true;
				}
			}
		}
		if (direction === "prev") {
			const prevEdit = edits.reduce((acc, edit, idx) => {
				if (edit.commonState.offset < uiStore.timelineControls.playPosition
					&& edit.commonState.offset >= acc.offset) {
					return {
						offset: edit.commonState.offset,
						editIdx: idx,
					};
				}
				return acc;
			}, {
				offset: 0,
				editIdx: -1,
			});
			if (prevEdit.editIdx !== -1) {
				uiStore.timelineControls.playPosition = prevEdit.offset;
				uiStore.selectTimelineObjects([edits[prevEdit.editIdx]]);
				uiStore.logData("timelineJumpPrev", {
					suggested: curIntent.suggestedEdits.length > 0,
				});
				return true;
			}
			return false;
		} else if (direction === "next") {
			const nextEdit = edits.reduce((acc, edit, idx) => {
				if (edit.commonState.offset > uiStore.timelineControls.playPosition
					&& edit.commonState.offset <= acc.offset) {
					return {
						offset: edit.commonState.offset,
						editIdx: idx,
					};
				}
				return acc;
			}, {
				offset: domainStore.projectMetadata.duration,
				editIdx: -1,
			});
			if (nextEdit.editIdx !== -1) {
				uiStore.timelineControls.playPosition = nextEdit.offset;
				uiStore.selectTimelineObjects([edits[nextEdit.editIdx]]);
				uiStore.logData("timelineJumpNext", {
					suggested: curIntent.suggestedEdits.length > 0,
				});
				return true;
			}
			return false;
		}
	});

    useEffect(
        action(() => {
            if (uiStore.timelineControls.isPlaying
				&& uiStore.timelineControls.playPosition >= domainStore.projectMetadata.duration) {
				// if (uiStore.timelineControls.intervalId !== -1) {
				// 	clearInterval(uiStore.timelineControls.intervalId);
				// }
                // uiStore.timelineControls.intervalId = -1;
                uiStore.timelineControls.playPosition = 0;
                uiStore.timelineControls.isPlaying = false;
            }
			// else {
			// 	if (uiStore.timelineControls.intervalId === -1 && uiStore.timelineControls.isPlaying) {
			// 		uiStore.timelineControls.intervalId = setInterval(action(() => {
			// 			uiStore.timelineControls.playPosition += 0.1;
			// 		}), 100);
			// 	}
			// }
        }),
        [
			//uiStore.timelineControls.intervalId,
            uiStore.timelineControls.playPosition,
            domainStore.projectMetadata.duration,
			uiStore.timelineControls.isPlaying,
        ]
    );

	// useEffect(action(() => {
	// 	if (uiStore.timelineControls.selectedTimelineItems.length === 0 
	// 		&& !uiStore.timelineControls.splitting
	// 	) {
	// 		uiStore.timelineControls.rangeSelectingTimeline = true;
	// 		uiStore.timelineControls.rangeSelectingFirstPx = -1;
	// 	}
	// }), [
	// 	uiStore.timelineControls.selectedTimelineItems.length,
	// 	uiStore.timelineControls.splitting
	// ]);

	const buttonClassName = " disabled:hover:bg-gray-300 text-black p-1 rounded disabled:opacity-50";
	const decisionClassName = " text-black p-1 rounded disabled:opacity-50";
    return (
        <div 
			className="w-full bg-gray-100 border px-2 disable-select"
			onKeyDown={onKeyDown}
		>
            <div className="flex flex-row justify-between my-2">
				<div className="flex flex-row gap-2 h-fit">
					<button className={((curIntent.suggestedEdits.length === 0 || domainStore.processingIntent)
								? "bg-gray-300 hover:bg-gray-400" : "bg-yellow-300 hover:bg-yellow-400"
							) 
							+ decisionClassName}
							id="play_button" onClick={onPressPlay}>
						{
							uiStore.timelineControls.isPlaying ? <PauseIcon /> : <PlayIcon />
						}
					</button>
				</div>
				<div className="flex flex-col justify-center gap-1">
					<div className="flex gap-1 justify-center">
						<button
							className={((curIntent.suggestedEdits.length === 0 || domainStore.processingIntent)
									? "bg-indigo-200 hover:bg-indigo-300 disabled:hover:bg-indigo-200" : "bg-yellow-300 hover:bg-yellow-400 disabled:hover:bg-yellow-300"
								) 
								+ decisionClassName}
							id="prev_button"
							onClick={() => onNavigationClick("prev")}
							disabled={
								curIntent.suggestedEdits.length === 0
								&& curIntent.activeEdits.length === 0
							}
						>
							<BsFillSkipBackwardFill />
						</button>
						<div className={ ("flex flex-row gap-1 justify-center"
								+ ((selectedSuggestedEdits.length === 0 || domainStore.processingIntent) ? " invisible" : " visible")
								)}
						>
							<button
								className={"bg-green-300 hover:bg-green-500" + decisionClassName}
								id="accept_button"
								onClick={() => onDecisionClick("accept")}
							>
								<CheckIcon />
								{/* {selectedSuggestedEdits.length > 1 ? "All" : ""} */}
							</button>
							<button
								className={"bg-red-300 hover:bg-red-500" + decisionClassName}
								id="reject_button"
								onClick={() => onDecisionClick("reject")}
							>
								<CrossIcon /> 
								{/* {selectedSuggestedEdits.length > 1 ? "All" : ""} */}
							</button>
						</div>
						<button
							className={((curIntent.suggestedEdits.length === 0 || domainStore.processingIntent)
								? "bg-indigo-200 hover:bg-indigo-300 disabled:hover:bg-indigo-200" : "bg-yellow-300 hover:bg-yellow-400 disabled:hover:bg-yellow-300"
							) 
							+ decisionClassName}
							id="next_button"
							onClick={() => onNavigationClick("next")}
							disabled={
								curIntent.suggestedEdits.length === 0
								&& curIntent.activeEdits.length === 0
							}
						>
							<BsFillSkipForwardFill />
						</button>
					</div>
					{curIntent.suggestedEdits.length === 0 ? (
						(curIntent.processingAllowed === true && curIntent.searchMoreAllowed
							&& uiStore.commandSpaceControls.viewPortStart < uiStore.commandSpaceControls.viewPortFinish
						) ? (
							<div className="flex gap-1 justify-center">
								<button
									className={"items-center bg-indigo-200 hover:bg-indigo-300 disabled:hover:bg-indigo-200 flex flex-row gap-1"
										+ decisionClassName}
									onClick={() => onMoreClick()}
									disabled={curIntent.processingAllowed === false || domainStore.processingIntent}
								>
									<FaSearch />
									<span className="font-bold">
										{playPositionToFormat(uiStore.commandSpaceControls.viewPortStart)
										} - {playPositionToFormat(uiStore.commandSpaceControls.viewPortFinish)}
									</span>
								</button>
							</div>
						) : null
					) : (
						<div className="flex gap-1 justify-center">
							<span> [{
								selectedSuggestedEdits.map((edit, idx) => {
									const isLast = idx === selectedSuggestedEdits.length - 1;
									let pos = 0;
									for (let sugestedEdit of curIntent.suggestedEdits) {
										if (sugestedEdit.commonState.offset <= edit.commonState.offset) {
											pos += 1;
										}
									}
									return pos + (isLast ? "" : ", ");
								})
							}] / {curIntent.suggestedEdits.length} </span>
						</div>
					)}
				</div>
				<div className="flex flex-row flex-center gap-2 h-fit">
					{/* <div className="flex p-1 bg-indigo-200 rounded">
						<span> {uiStore.timelineControls.selectedTimelineItems.length} </span>
					</div> */}
					<button
						className={
							(uiStore.timelineControls.rangeSelectingTimeline
								? "bg-gray-500"
								: "bg-gray-300 hover:bg-gray-400 ") + buttonClassName
						}
						onClick={onPressRangeSelect}
						id="intentselect_button"
					>
						<PlusIcon />
					</button>
					<button
						className={
							(uiStore.timelineControls.splitting
								? "bg-gray-500"
								: "bg-gray-300 hover:bg-gray-400 ") + buttonClassName
						}
						onClick={onPressSplit}
						id="split_button"
						disabled={curIntent.activeEdits.length === 0}
					>
						<TfiSplitH />
					</button>
					<button
						className={"bg-gray-300 hover:bg-gray-400 " + buttonClassName}
						id="delete_button"
						onClick={onCopyPasteTimelineItems}
						disabled={
							uiStore.timelineControls.selectedTimelineItems.length !== 1
							|| selectedSuggestedEdits.length > 0
						}
					>
						<CopyIcon />
					</button>
					<button
						className={"bg-gray-300 hover:bg-gray-400 " + buttonClassName}
						id="delete_button"
						onClick={onDeleteTimelineItems}
						disabled={uiStore.timelineControls.selectedTimelineItems.length === 0}
					>
						<TrashcanIcon />
					</button>
				</div>
            </div>
			{
				uiStore.navigation === "timeline" ? (<div className="flex flex-col">
					<div className="self-end flex flex-row items-center">
						<label htmlFor="timeline_zoom">
							{" "}
							Timeline Zoom {
								//`${roundNumber(uiStore.timelineSize.width / uiStore.timelineControls.pxPerSec, 0)}s`
							}{" "}
						</label>
						<input
							className="mx-2"
							id="timeline_zoom"
							type={"range"}
							min={0}
							max={100}
							value={uiStore.adaptPxPerSec(uiStore.timelineControls.pxPerSec)}
							onChange={onZoomChange}
							step={5}
						/>
					</div>
					<TimelineTracks />
				</div>) : null
			}
        </div>
    );
});

export default Timeline;
