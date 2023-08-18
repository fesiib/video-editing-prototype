import React, { useEffect } from "react";

import { action } from "mobx";
import { observer } from "mobx-react-lite";

import TimelineTracks from "../components/timeline/TimelineTracks";

import useRootContext from "../hooks/useRootContext";

const Timeline = observer(function Timeline() {
    const { uiStore, domainStore } = useRootContext();

    const onZoomChange = action((event) => {
        uiStore.timelineControls.pxPerSec = event.target.value / 10;
    });

    const onPressPlay = action((event) => {
        uiStore.timelineControls.tryPlaying = !uiStore.timelineControls.tryPlaying;
        if (uiStore.timelineControls.intervalId !== -1) {
            clearTimeout(uiStore.timelineControls.intervalId);
            uiStore.timelineControls.intervalId = -1;
        } else {
            const updatePlayPosition = action((prevDate) => {
                if (uiStore.timelineControls.intervalId === -1) {
                    return;
                }
                const curDate = Date.now();
                const time = curDate - prevDate;
                uiStore.timelineControls.playPosition += time / 1000;
                uiStore.timelineControls.intervalId = setTimeout(
                    updatePlayPosition,
                    uiStore.timelineConst.delay,
                    curDate
                );
            });
            uiStore.timelineControls.intervalId = setTimeout(
                updatePlayPosition,
                uiStore.timelineConst.delay,
                Date.now()
            );
        }
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
        console.log(selectedSceneIds, uiStore.timelineControls.selectedTimelineItems.length);
        domainStore.deleteEdits(selectedSceneIds);
    });

    const onDeleteKeyDown = action((event) => {
        if (event.which === 46) {
            ///delete key
            onDeleteTimelineItems();
        }
    });

    const onBackgroundClick = action((event) => {
        uiStore.timelineControls.selectedTimelineItems = [];
        if (uiStore.timelineControls.splitting) {
        }
        uiStore.timelineControls.splitting = false;
    });

    useEffect(
        action(() => {
            if (uiStore.timelineControls.intervalId === -1) {
                return;
            }
            if (uiStore.timelineControls.playPosition >= domainStore.projectMetadata.duration) {
                clearTimeout(uiStore.timelineControls.intervalId);
                uiStore.timelineControls.intervalId = -1;
                uiStore.timelineControls.playPosition = 0;
                uiStore.timelineControls.tryPlaying = false;
            }
        }),
        [
            uiStore.timelineControls.playPosition,
            domainStore.projectMetadata.duration,
            uiStore.timelineControls.intervalId,
        ]
    );

    return (
        <div className="bg-slate-100" onClick={onBackgroundClick} onKeyDown={onDeleteKeyDown}>
            <div className="flex justify-between">
                <button className="bg-indigo-300 p-1" id="play_button" onClick={onPressPlay}>
                    {uiStore.timelineControls.tryPlaying ? "pause" : "play"}
                </button>
                <button
                    className={
                        uiStore.timelineControls.splitting
                            ? "bg-indigo-500 p-1"
                            : "bg-indigo-300 p-1"
                    }
                    onClick={onPressSplit}
                    id="split_button"
                >
                    {uiStore.timelineControls.splitting ? "Splitting" : "Split"}
                </button>
				<button
                    className={
                        uiStore.timelineControls.rangeSelectingTimeline
                            ? "bg-indigo-500 p-1"
                            : "bg-indigo-300 p-1"
                    }
                    onClick={onPressRangeSelect}
                    id="intentselect_button"
                >
                    {uiStore.timelineControls.rangeSelectingTimeline ? "Range Selecting" : "Range Select"}
                </button>
                <button
                    className={"bg-indigo-300 p-1"}
                    id="delete_button"
                    onClick={onDeleteTimelineItems}
                >
                    Delete
                </button>
                <div className="bg-indigo-300 p-1">
                    <label htmlFor="speed_input"> Speed </label>
                    <input
                        id="speed_input"
                        type="number"
                        style={{
                            width: 50,
                        }}
                        step={0.25}
                    />
                </div>
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
        </div>
    );
});

export default Timeline;
