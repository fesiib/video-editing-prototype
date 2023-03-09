import React, { useMemo } from "react";

import { observer } from "mobx-react-lite";
import { action } from "mobx";

import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";

import TimelinePositionIndicator from "./TimelinePositionIndicator";

import useRootContext from "../../hooks/useRootContext";
import { playPositionToFormat } from "../../utilities/timelineUtilities";

const TimelineLabels = observer(function TimelineLabels({}) {
    const { uiStore } = useRootContext();

    const width = uiStore.trackWidthPx;
    const height = uiStore.timelineConst.labelHeight;
    const labelIntervalPx = uiStore.timelineConst.labelIntervalPx;

    const labels = useMemo(() => {
        const newLabels = [];
        for (let px = 0; px < width; px += labelIntervalPx) {
            let timestamp = uiStore.pxToSec(px + labelIntervalPx);
            newLabels.push(timestamp);
        }
        return newLabels;
    }, [width, labelIntervalPx]);

    const onIndicatorDragEnd = action((event) => {
        const { delta } = event;
        uiStore.timelineControls.playPosition += uiStore.pxToSec(delta.x);
    });

    return (
        <DndContext
            sensors={useSensors(useSensor(PointerSensor))}
            modifiers={[restrictToHorizontalAxis]}
            onDragEnd={onIndicatorDragEnd}
        >
            <div
                className={"bg-slate-500 flex relative"}
                style={{
                    width: width,
                    height: height,
                }}
            >
                {labels.map((timestamp) => {
                    return (
                        <span
                            key={"label" + timestamp}
                            className={"text-xs text-right border-r-2"}
                            style={{
                                width: labelIntervalPx,
                                height: uiStore.timelineConst.labelHeight,
                            }}
                        >
                            {playPositionToFormat(timestamp)}
                        </span>
                    );
                })}

                <TimelinePositionIndicator />
            </div>
        </DndContext>
    );
});

export default TimelineLabels;
