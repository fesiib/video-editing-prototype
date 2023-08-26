import React, { useEffect } from "react";

import { action } from "mobx";
import { observer } from "mobx-react-lite";

import TimelineTracks from "../components/timeline/TimelineTracks";

import useRootContext from "../hooks/useRootContext";

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
        uiStore.timelineControls.pxPerSec = event.target.value / 10;
    });

    const onPressPlay = action((event) => {
        uiStore.timelineControls.isPlaying = !uiStore.timelineControls.isPlaying;
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
			// TODO: add selectedSuggestedEdits to active edits
			// change isSuggested to false
			return;
		}
		else if (decision === "reject") {
			// TODO: delete selectedSuggestedEdits
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

	const buttonClassName = " hover:bg-indigo-400 text-black py-2 px-4 rounded";
	const decisionClassName = " text-black py-2 px-4 rounded";

    return (
        <div className="bg-slate-100 disable-select" onKeyDown={onDeleteKeyDown}>
            <div className="flex justify-between">
                <button className={"bg-indigo-300" + buttonClassName} id="play_button" onClick={onPressPlay}>
                    {uiStore.timelineControls.isPlaying ? "pause" : "play"}
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
                    {uiStore.timelineControls.splitting ? "Splitting" : "Split"}
                </button>
				<button
                    className={
                        (uiStore.timelineControls.rangeSelectingTimeline
                            ? "bg-indigo-500"
                            : "bg-indigo-300") + buttonClassName
                    }
                    onClick={onPressRangeSelect}
                    id="intentselect_button"
                >
                    {uiStore.timelineControls.rangeSelectingTimeline ? "Range Selecting" : "Range Select"}
                </button>
                <button
                    className={"bg-indigo-300" + buttonClassName}
                    id="delete_button"
                    onClick={onDeleteTimelineItems}
                >
                    Delete
                </button>
                {/* <div className="bg-indigo-300 p-1">
                    <label htmlFor="speed_input"> Speed </label>
                    <input
                        id="speed_input"
                        type="number"
                        style={{
                            width: 50,
                        }}
                        step={0.25}
                    />
                </div> */}
                <div>
                    <label htmlFor="timelinen_zoom">
                        {" "}
                        Pixels per second {uiStore.timelineControls.pxPerSec}{" "}
                    </label>
                    <input
                        id="timeline_zoom"
                        type={"range"}
                        min={10}
                        max={1000}
                        value={uiStore.timelineControls.pxPerSec * 10}
                        onChange={onZoomChange}
                        step={5}
                    />
                </div>
            </div>

            <TimelineTracks />
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
				{selectedSuggestedEdits.length === 0 ? null : (
					<div className="flex gap-1 justify-center">
						<button
							className={"bg-green-300 hover:bg-green-500" + decisionClassName}
							id="accept_button"
							onClick={() => onDecisionClick("accept")}
						>
							Accept {selectedSuggestedEdits.length > 1 ? "All" : ""}
						</button>
						<button
							className={"bg-red-300 hover:bg-red-500" + decisionClassName}
							id="reject_button"
							onClick={() => onDecisionClick("reject")}
						>
							Reject {selectedSuggestedEdits.length > 1 ? "All" : ""}
						</button>
					</div>
				)}
				{domainStore.curIntent.suggestedEdits.length === 0 ? null : (
					<div className="flex gap-1 justify-center">
						<span> # of suggested edits: </span> <span> {domainStore.curIntent.suggestedEdits.length} </span>
					</div>
				)}
			</div>
        </div>
    );
});

export default Timeline;
