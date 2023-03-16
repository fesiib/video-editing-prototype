import React, { forwardRef } from "react";

import { observer } from "mobx-react-lite";

import DraggableTimelineItem from "./DraggableTimelineItem";

import useRootContext from "../../hooks/useRootContext";

const TimelineTrack = observer(
    forwardRef(function TimelineTrack({ id, title, scenes, isOverlay, isOver, ...props }, ref) {
        const { uiStore } = useRootContext();
        const width = uiStore.trackWidthPx;

		return (
            <div {...props} ref={ref}>
                <div
                    className={
                        isOverlay
                            ? "bg-slate-600 my-1 relative h-10"
                            : isOver
                            ? "bg-slate-500 my-1 relative h-10"
                            : "bg-slate-400 my-1 relative h-10"
                    }
                    style={{
                        width: width,
                    }}
                >
                    <div className="absolute inset-y-0 left-0">{title}</div>
                    {scenes.map((scene) => (
                        <DraggableTimelineItem key={scene.commonState.id} scene={scene} scenes={scenes} />
                    ))}
                </div>
            </div>
        );
    })
);

export default TimelineTrack;
