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

		const willOverflow = 
			uiStore.secToPx(scene.commonState.sceneDuration) < uiStore.timelineConst.minTimelineItemWidthPx;

        const style = {
            transform:
                typeof transform?.x === "number"
                    ? `translate3d(${
                          uiStore.secToPx(scene.commonState.offset) + transform.x
                      }px, ${0}px, ${0}px)`
                    : `translate3d(${uiStore.secToPx(scene.commonState.offset)}px, ${0}px, ${0}px)`,
            width: (uiStore.secToPx(scene.commonState.sceneDuration)),
            //transition: `transform ${0.5}s`,
			backgroundColor: uiStore.labelColorPalette[lowLabel],
			opacity: (isOverlay ? 0.8 : 1),
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
                {isOverlay ? (<span>
					{uiStore.timelineControls.selectedTimelineItems.length > 1 ? 
						uiStore.timelineControls.selectedTimelineItems.length + " scenes" :
						"1 scene"
					}
					
				</span>
                ) : (<div className="flex justify-between">
					<TrimWrapper 
						scene={scene}
						scenes={scenes}
					>
						<span id={"label_" + scene.commonState.id}>
							{ !willOverflow ? lowLabel : "" }
						</span>
					</TrimWrapper>
					{/* <span className="grow"> {lowLabel} </span> */}
				</div>)}
            </div>
        );
    })
);

export default TimelineItem;
