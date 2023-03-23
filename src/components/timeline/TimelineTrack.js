import React, { forwardRef, useState } from "react";

import { observer } from "mobx-react-lite";

import DraggableTimelineItem from "./DraggableTimelineItem";

import useRootContext from "../../hooks/useRootContext";

const TimelineTrack = observer(
    forwardRef(function TimelineTrack(
        { id, style, title, scenes, isOverlay, isOver, setActivatorNodeRef, listeners, attributes },
        ref
    ) {
        const { uiStore } = useRootContext();
        const width = uiStore.trackWidthPx;
        const handlerWidth = uiStore.timelineConst.trackHandlerWidth;

        return (
            <div
                ref={ref}
                id={id}
                className="flex flex-row flex-nowrap"
                style={{
                    ...style,
                    width: handlerWidth + width,
                    overflow: "visible",
                }}
            >
                <div
                    ref={setActivatorNodeRef}
                    className="my-2"
                    style={{
                        width: handlerWidth,
                        overflow: "hidden",
                    }}
                    {...listeners}
                    {...attributes}
                >
                    {" "}
                    {title}
                </div>
                <div
                    className={
                        isOverlay
                            ? "bg-slate-600 my-1 relative h-14"
                            : isOver
                            ? "bg-slate-500 my-1 relative h-14"
                            : "bg-slate-400 my-1 relative h-14"
                    }
                    style={{
                        width: width,
                    }}
                >
                    {scenes.map((scene) => (
                        <DraggableTimelineItem
                            key={scene.commonState.id}
                            scene={scene}
                            scenes={scenes}
                        />
                    ))}
                </div>
            </div>
        );
    })
);

export default TimelineTrack;
