import React from "react";

import { observer } from "mobx-react-lite";

import { useDraggable } from "@dnd-kit/core";

import useRootContext from "../../hooks/useRootContext";
import PositionIndicator from "./PositionIndicator";

const PlayPositionIndicator = observer(function PlayPositionIndicator() {
    const { uiStore } = useRootContext();

    const height = uiStore.timelineSize.height;
    const positionIndicatorWidth = uiStore.timelineConst.positionIndicatorWidth;
    const handlerWidth = uiStore.timelineConst.trackHandlerWidth;

    const { setNodeRef, listeners, attributes, transform, isDragging } = useDraggable({
        id: "position_indicator",
    });
    const transformSeconds = typeof transform?.x === "number" ? uiStore.pxToSec(transform.x) : 0;
    const playPosition = Math.min(
		uiStore.timelineConst.trackMaxDuration,
        Math.max(
            uiStore.timelineConst.trackMinDuration,
            uiStore.timelineControls.playPosition + transformSeconds
        )
    );
    const playPositionPx = uiStore.secToPx(playPosition);
    return (
        <>
            <div
                className={
                    isDragging ? "absolute z-50 bg-violet-500" : "absolute z-50 hover:bg-violet-500"
                }
                style={{
                    height: height,
                    left: handlerWidth - positionIndicatorWidth / 2,
                    transform: `translate3d(${playPositionPx}px, 0px, 0px)`,
                }}
                ref={setNodeRef}
                {...listeners}
                {...attributes}
            >
                <PositionIndicator showLabel={isDragging} positionIndicatorSec={playPosition} />
            </div>
        </>
    );
});

export default PlayPositionIndicator;
