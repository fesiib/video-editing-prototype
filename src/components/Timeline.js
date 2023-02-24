import { observable } from "mobx";
import React from "react";
import { Layer, Rect, Stage } from "react-konva";

const Timeline = observable(function Timeline({ uiStore, domainStore }) {
    return (
        <>
            <div>Timeline</div>
            <Stage width={uiStore.canvasSize.width} height={uiStore.canvasSize.height}>
                <Layer>
                    <Rect
                        x={0}
                        y={0}
                        width={uiStore.canvasSize.width}
                        height={uiStore.canvasSize.height}
                        fill="red"
                        onClick={onBackgroundClick}
                    />
                </Layer>
            </Stage>
        </>
    );
});

export default Timeline;
