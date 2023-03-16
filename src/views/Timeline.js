import React from "react";

import { action } from "mobx";
import { observer } from "mobx-react-lite";

import TimelineTracks from "../components/timeline/TimelineTracks";

import useRootContext from "../hooks/useRootContext";

const Timeline = observer(function Timeline() {
    const { uiStore } = useRootContext();

    const onZoomChange = action((event) => {
        uiStore.timelineControls.pxPerSec = event.target.value / 10;
    });

    return (
        <div className="bg-slate-100">
            <div className="flex justify-between">
                <div>
                    <label htmlFor="play_button" className="bg-indigo-300 p-1">
                        {" "}
                        Play{" "}
                    </label>
                    <input id="play_button" type="button" />
                </div>
                <div>
                    <label htmlFor="split_button" className="bg-indigo-300 p-1">
                        {" "}
                        Split{" "}
                    </label>
                    <input id="split_button" type="button" />
                </div>
                <div>
                    <label htmlFor="speed_input" className="bg-indigo-300 p-1">
                        {" "}
                        Speed{" "}
                    </label>
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
