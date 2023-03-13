import React, { forwardRef } from "react";

import { observer } from "mobx-react-lite";

import useRootContext from "../../hooks/useRootContext";

import ResizeWrapper from "./ResizeWrapper";

export const TimelineItem = observer(
    forwardRef(function TimelineItem({ scene, transform, isOverlay, ...props }, ref) {
        const { uiStore } = useRootContext();

        const style = {
            transform: (transform ? 
				`translate3d(${
					uiStore.secToPx(scene.commonState.offset) + transform.x
				}px, ${0 + transform.y}px, ${0}px)`
                : `translate3d(${uiStore.secToPx(scene.commonState.offset)}px, ${0}px, ${0}px)`),
            width: uiStore.secToPx(scene.commonState.duration),
        };

        return (
            <div
                className={
                    isOverlay ? "bg-yellow-600 absolute z-10" : "bg-yellow-400 absolute z-10"
                }
                ref={ref}
                style={style}
                {...props}
            >
                {isOverlay ? (
                    "overlay"
                ) : (
                    <div className="flex justify-between">
                        <ResizeWrapper scene={scene}>{scene.commonState.id}</ResizeWrapper>
                    </div>
                )}
            </div>
        );
    })
);

export default TimelineItem;
