import React, { forwardRef } from "react";

import { observer } from "mobx-react-lite";

import useRootContext from "../../hooks/useRootContext";

import TrimWrapper from "./TrimWrapper";

export const TimelineItem = observer(
    forwardRef(function TimelineItem({ scene, scenes, transform, isOverlay, ...props }, ref) {
        const { uiStore } = useRootContext();

		const lowLabel = (scene.commonState.thumbnails.length > 0 ?
			scene.commonState.thumbnails[0] : "misc");

		const isSelected = uiStore.timelineControls.selectedTimelineItems.findIndex(
			(value) => value.commonState.id === scene.commonState.id
		) >= 0;

        const style = {
            transform:
                typeof transform?.x === "number"
                    ? `translate3d(${
                          uiStore.secToPx(scene.commonState.offset) + transform.x
                      }px, ${0}px, ${0}px)`
                    : `translate3d(${uiStore.secToPx(scene.commonState.offset)}px, ${0}px, ${0}px)`,
            width: uiStore.secToPx(scene.commonState.sceneDuration),
            //transition: `transform ${0.5}s`,
			backgroundColor: uiStore.labelColorPalette[lowLabel],
			
        };
        return (
            <div
                className={ isSelected ?
					"absolute z-10 border border-red-400" :
					"absolute z-10 border" 
				}
                ref={ref}
                style={style}
                {...props}
            >
                {isOverlay ? (
                    "overlay"
                ) : (
                    <div className="flex justify-between">
                        <TrimWrapper 
							scene={scene}
							scenes={scenes}
						>{lowLabel}</TrimWrapper>
						{/* <span className="grow"> {lowLabel} </span> */}
                    </div>
                )}
            </div>
        );
    })
);

export default TimelineItem;
