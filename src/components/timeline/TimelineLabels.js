import React, { useMemo } from "react";

import { observer } from "mobx-react-lite";
import { action } from "mobx";

import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";

import PositionIndicator from "./PositionIndicator";
import PlayPositionIndicator from "./PlayPositionIndicator";

import useRootContext from "../../hooks/useRootContext";
import { playPositionToFormat } from "../../utilities/timelineUtilities";

const TimelineLabels = observer(function TimelineLabels() {
    const { uiStore } = useRootContext();

    const width = uiStore.trackWidthPx;
    const height = uiStore.timelineConst.labelHeight;
    const handlerWidth = uiStore.timelineConst.trackHandlerWidth;
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
        const transformSeconds = uiStore.pxToSec(delta.x);
        // if (uiStore.timelineControls.isPlaying) {
        // 	uiStore.timelineControls.tryPlaying = false;
        // }
        uiStore.timelineControls.playPosition = Math.min(
            uiStore.timelineConst.trackMaxDuration,
            Math.max(
                uiStore.timelineConst.trackMinDuration,
                uiStore.timelineControls.playPosition + transformSeconds
            )
        );
    });

    const showPositionIndicator = action((event) => {
        uiStore.timelineControls.positionIndicatorVisibility += 1;
    });

    const hidePositionIndicator = action((event) => {
        uiStore.timelineControls.positionIndicatorVisibility -= 1;
    });

    const updatePositionIndicator = action((event) => {
        const labelsDiv = document.getElementById(uiStore.timelineConst.timelineLabelsId);

        const timelineRect = labelsDiv.getBoundingClientRect();
        let positionIndicatorPx =
            event.clientX - timelineRect.left + labelsDiv.scrollLeft - handlerWidth;
        if (positionIndicatorPx < 0) {
            positionIndicatorPx = 0;
        }
        uiStore.timelineControls.positionIndicatorSec = uiStore.pxToSec(positionIndicatorPx);
    });

    const onLabelClick = action((event) => {
        // if (uiStore.timelineControls.isPlaying) {
        // 	uiStore.timelineControls.tryPlaying = false;
        // }
        const labelsDiv = document.getElementById(uiStore.timelineConst.timelineLabelsId);

        const timelineRect = labelsDiv.getBoundingClientRect();
        let playPositionPx =
            event.clientX - timelineRect.left + labelsDiv.scrollLeft - handlerWidth;
        if (playPositionPx < 0) {
            return;
        }
        uiStore.timelineControls.playPosition = uiStore.pxToSec(playPositionPx);
    });

    const positionIndicatorVisibility = uiStore.timelineControls.positionIndicatorVisibility;
    const positionIndicatorSec = uiStore.timelineControls.positionIndicatorSec;

    return (
        <div>
            <DndContext
                sensors={useSensors(useSensor(PointerSensor))}
                modifiers={[restrictToHorizontalAxis]}
                onDragEnd={onIndicatorDragEnd}
            >
                <PlayPositionIndicator />
            </DndContext>
            <div
                className="flex flex-row flex-nowrap"
                style={{
                    width: width + handlerWidth,
                    height: height,
                }}
                id={uiStore.timelineConst.timelineLabelsId}
                onMouseEnter={showPositionIndicator}
                onMouseLeave={hidePositionIndicator}
                onMouseMove={updatePositionIndicator}
            >
                <div
                    //className="my-2"
                    style={{
                        width: handlerWidth,
                        overflow: "hidden",
                    }}
                >
                    {" "}
                    #
                </div>
                <div
                    className={"bg-slate-500 flex relative"}
                    style={{
                        width: width,
                        height: height,
                    }}
                    onClick={onLabelClick}
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
                </div>
                {positionIndicatorVisibility > 0 ? (
                    <div
                        id={uiStore.timelineConst.positionIndicatorId}
                        className={"absolute top-0 z-30"}
                        style={{
                            height: uiStore.timelineSize.height,
                            left: handlerWidth - uiStore.timelineConst.positionIndicatorWidth / 2,
                            transform: `translate3d(${uiStore.secToPx(
                                positionIndicatorSec
                            )}px, 0px, 0px)`,
                        }}
                    >
                        <PositionIndicator
                            showLabel={true}
                            positionIndicatorSec={positionIndicatorSec}
                            className="opacity-80 pointer-events-none"
                        />
                    </div>
                ) : null}
            </div>
        </div>
    );
});

export default TimelineLabels;
