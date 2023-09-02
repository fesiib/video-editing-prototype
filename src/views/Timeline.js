import React, { useEffect } from "react";

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

const Timeline = observer(function Timeline() {
    const { uiStore, domainStore } = useRootContext();

	// const selectedSuggestedEdits = domainStore.curIntent.suggestedEdits.filter((edit) => {
	// 	return uiStore.timelineControls.selectedTimelineItems.findIndex((item) => {
	// 		return item.commonState.id === edit.commonState.id;
	// 	}) >= 0;
	// });

	const selectedSuggestedEdits = uiStore.timelineControls.selectedTimelineItems.filter((item) => {
		return item.isSuggested;
	});

    const onZoomChange = action((event) => {
		// 0 -> minPxToSec
		// 100 -> maxPxToSec
		// value * (maxPxToSec - minPxToSec) / 100 + minPxToSec
        uiStore.timelineControls.pxPerSec = uiStore.adaptZoomValue(event.target.value);
    });

    const onPressPlay = action((event) => {
		event.preventDefault();
		event.stopPropagation();
        uiStore.timelineControls.isPlaying = !uiStore.timelineControls.isPlaying;
		uiStore.logData("play", {
			isPlaying: uiStore.timelineControls.isPlaying,
		});
    });

    const onPressSplit = action((event) => {
        event.preventDefault();
        event.stopPropagation();
		uiStore.timelineControls.rangeSelectingTimeline = false;
		uiStore.timelineControls.rangeSelectingFirstPx = -1;
        if (uiStore.timelineControls.splitting === true) {
            uiStore.timelineControls.splitting = false;
            return;
        }
        uiStore.timelineControls.splitting = true;
    });

	const onPressRangeSelect = action((event) => {
        event.preventDefault();
        event.stopPropagation();
        uiStore.timelineControls.splitting = false;
		if (uiStore.timelineControls.rangeSelectingTimeline === true) {
            uiStore.timelineControls.rangeSelectingTimeline = false;
			uiStore.timelineControls.rangeSelectingFirstPx = -1;
            return;
        }
        uiStore.timelineControls.rangeSelectingTimeline = true;
    });


    const onDeleteTimelineItems = action(() => {
        const selectedSceneIds = uiStore.timelineControls.selectedTimelineItems.map(
            (value) => value.commonState.id
        );
        domainStore.curIntent.deleteEdits(selectedSceneIds);
		uiStore.selectTimelineObjects([]);
    });

    const onDeleteKeyDown = action((event) => {
        if (event.which === 46) {
            ///delete key
            onDeleteTimelineItems();
        }
    });

	const onDecisionClick = action((decision) => {
		if (decision === "accept") {
			for (const edit of selectedSuggestedEdits) {
				domainStore.curIntent.addEditFromSuggested(edit.commonState.id);
			}
			const deleteEditIds = selectedSuggestedEdits.map((edit) => edit.commonState.id);
			domainStore.curIntent.deleteEdits(deleteEditIds);
			return;
		}
		else if (decision === "reject") {
			const deleteEditIds = selectedSuggestedEdits.map((edit) => edit.commonState.id);
			domainStore.curIntent.deleteEdits(deleteEditIds);
			onNavigationClick("next");
			return;
		}
	});

	const onNavigationClick = action((direction) => {
		const edits = (domainStore.curIntent.suggestedEdits.length > 0 ?
			domainStore.curIntent.suggestedEdits : domainStore.curIntent.activeEdits);
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
			}
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
			}
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

	const buttonClassName = " hover:bg-indigo-400 text-black p-1 rounded";
	const decisionClassName = " text-black my-1 rounded";

    return (
        <div className="w-full bg-gray-100 border px-2 disable-select" onKeyDown={onDeleteKeyDown}>
            <div className="flex flex-row justify-between my-2">
				<div className="flex flex-row gap-2">
					<button className={"bg-indigo-300" + buttonClassName} id="play_button" onClick={onPressPlay}>
						{
							uiStore.timelineControls.isPlaying ? <PauseIcon /> : <PlayIcon />
						}
					</button>
				</div>
				<div className="flex flex-row flex-center gap-2">
					<div className="flex p-1 bg-indigo-200 rounded">
						<span> {uiStore.timelineControls.selectedTimelineItems.length} </span>
					</div>
					<button
						className={
							(uiStore.timelineControls.rangeSelectingTimeline
								? "bg-indigo-500"
								: "bg-indigo-300") + buttonClassName
						}
						onClick={onPressRangeSelect}
						id="intentselect_button"
					>
						<PlusIcon />
					</button>
					<button
						className={
							(uiStore.timelineControls.splitting
								? "bg-indigo-500"
								: "bg-indigo-300") + buttonClassName
						}
						onClick={onPressSplit}
						id="split_button"
					>
						<ScissorsIcon />
					</button>
					<button
						className={"bg-indigo-300" + buttonClassName}
						id="delete_button"
						onClick={onDeleteTimelineItems}
					>
						<TrashcanIcon />
					</button>
				</div>
                <div className="self-end">
                    <label htmlFor="timelinen_zoom">
                        {" "}
                        Zoom {
							`${roundNumber(uiStore.timelineSize.width / uiStore.timelineControls.pxPerSec, 0)}s`
						}{" "}
                    </label>
                    <input
                        id="timeline_zoom"
                        type={"range"}
                        min={0}
                        max={100}
                        value={uiStore.adaptPxPerSec(uiStore.timelineControls.pxPerSec)}
                        onChange={onZoomChange}
                        step={5}
                    />
                </div>
            </div>
			{
				(selectedSuggestedEdits.length !== 1 || domainStore.processingIntent
				) ? null : (
					<div className="flex gap-1 justify-start px-2">
						<span> Explanation: </span> <span> {
							uiStore.timelineControls.selectedTimelineItems[0].explanation
						} </span>
						{ domainStore.curIntent.editOperation === null ? null : (<>
								<span> Parameter Help: </span> <span>
									{JSON.stringify(toJS(uiStore.timelineControls.selectedTimelineItems[0].suggestedParameters[domainStore.curIntent.editOperationKey]))}
								</span>
							</>)
						}
					</div>
				)
			}
			{
				uiStore.navigation === "timeline" ? (
					<TimelineTracks />
				) : null
			}

			<div className="flex flex-col justify-center gap-1">
				<div className="flex gap-1 justify-center">
					<button
						className={"bg-indigo-300" + buttonClassName}
						id="prev_button"
						onClick={() => onNavigationClick("prev")}
					>
						{"<-"}
					</button>
					<button
						className={"bg-indigo-300" + buttonClassName}
						id="next_button"
						onClick={() => onNavigationClick("next")}
					>
						{"->"}
					</button>
				</div>
				{(selectedSuggestedEdits.length === 0 || domainStore.processingIntent) ? null : (
					<div className="flex gap-1 justify-center">
						<button
							className={"bg-green-300 hover:bg-green-500" + decisionClassName}
							id="accept_button"
							onClick={() => onDecisionClick("accept")}
						>
							<CheckIcon /> {selectedSuggestedEdits.length > 1 ? "All" : ""}
						</button>
						<button
							className={"bg-red-300 hover:bg-red-500" + decisionClassName}
							id="reject_button"
							onClick={() => onDecisionClick("reject")}
						>
							<CrossIcon /> {selectedSuggestedEdits.length > 1 ? "All" : ""}
						</button>
					</div>
				)}
				{domainStore.curIntent.suggestedEdits.length === 0 ? null : (
					<div className="flex gap-1 justify-center">
						<span> {selectedSuggestedEdits.length} / {domainStore.curIntent.suggestedEdits.length} </span>
					</div>
				)}
			</div>
        </div>
    );
});

export default Timeline;
