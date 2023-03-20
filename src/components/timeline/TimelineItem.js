import React, { forwardRef } from "react";

import { observer } from "mobx-react-lite";

import useRootContext from "../../hooks/useRootContext";

import TrimWrapper from "./TrimWrapper";

export const TimelineItem = observer(
    forwardRef(function TimelineItem({ scene, transform, isOverlay, ...props }, ref) {
        const { uiStore } = useRootContext();
        const style = {
            transform:
                typeof transform?.x === "number"
                    ? `translate3d(${
                          uiStore.secToPx(scene.commonState.offset) + transform.x
                      }px, ${0}px, ${0}px)`
                    : `translate3d(${uiStore.secToPx(scene.commonState.offset)}px, ${0}px, ${0}px)`,
            width: uiStore.secToPx(scene.commonState.sceneDuration),
            transition: `transform ${0.5}s`,
        };
        return (
            <div
                className={
                    isOverlay ? "bg-yellow-600 absolute z-10 border" : "bg-yellow-400 absolute z-10 border"
                }
                ref={ref}
                style={style}
                {...props}
            >
                {isOverlay ? (
                    "overlay"
                ) : (
                    <div className="flex justify-between">
                        {/* <TrimWrapper scene={scene}>{scene.commonState.id}</TrimWrapper> */}
						<span className="grow"> {scene.commonState.thumbnails[0]} </span>
                    </div>
                )}
            </div>
        );
    })
);

export default TimelineItem;
