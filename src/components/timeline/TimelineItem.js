import React, { forwardRef } from "react";

import { observer } from "mobx-react-lite";

import useRootContext from "../../hooks/useRootContext";

import TrimWrapper from "./TrimWrapper";

export const TimelineItem = observer(
    forwardRef(function TimelineItem(
        { itemType, scene, scenes, transform, attributes, listeners, ...props },
        ref
    ) {
        const { uiStore, domainStore } = useRootContext();

        const lowLabel = scene.intent === undefined ?
        	(scene.commonState.thumbnails.length > 0 ? scene.commonState.thumbnails[0] : "")
			: scene.intent.editOperationKey;

		const isOverlay = itemType === "overlay";
		const isMain = itemType === "main";
		const isSkipped = itemType === "skipped";
		const isSuggestion = itemType === "suggestion";

        const isSelected =
            uiStore.timelineControls.selectedTimelineItems.findIndex(
                (value) => value.commonState.id === scene.commonState.id
            ) >= 0;

        const willOverflow =
            uiStore.secToPx(scene.commonState.sceneDuration) <
            uiStore.timelineConst.minTimelineItemWidthPx;

        const style = {
            transform:
                typeof transform?.x === "number"
                    ? `translate3d(${
                          uiStore.secToPx(scene.commonState.offset) + transform.x
                      }px, ${0}px, ${0}px)`
                    : `translate3d(${uiStore.secToPx(scene.commonState.offset)}px, ${0}px, ${0}px)`,
            width: uiStore.secToPx(scene.commonState.sceneDuration),
            //transition: `transform ${0.5}s`,
            backgroundColor: uiStore.editColorPalette[lowLabel],
            opacity: isOverlay ? 0.8 : 1,
        };

		let outerClassName = "";
		let innerClassName = "";

		if (isMain) {
			outerClassName = "absolute bottom-0 z-10";
			innerClassName = "h-6 bg-white";
		}
		else if (isSkipped) {
			outerClassName = "absolute bottom-0 z-10";
			innerClassName = "h-6 bg-gray-500";
		}
		else if (isSuggestion) {
			outerClassName = "absolute bottom-6 z-20 border";
			innerClassName = "h-6 bg-green-500";
		}
		else {
			outerClassName = (isSelected
				? "absolute bottom-6 z-10 border-2 border-red-600 brightness-50"
				: "absolute bottom-6 z-10 border");
			innerClassName = "flex justify-between";
		}

        return (
            <div
                className={outerClassName}
                ref={ref}
                style={style}
                {...attributes}
                {...listeners}
                {...props}
            >
                {isOverlay ? (
                    <span>
                        {uiStore.timelineControls.selectedTimelineItems.length > 1
                            ? uiStore.timelineControls.selectedTimelineItems.length + " scenes"
                            : "1 scene"}
                    </span>
                ) : (
					<div className={innerClassName}>
						{ (isMain || isSkipped || isSuggestion) ? null
							: (
								<TrimWrapper scene={scene} scenes={scenes}>
									<span id={"label_" + scene.commonState.id}>
										{!willOverflow ? lowLabel : ""}
									</span>
								</TrimWrapper>
							)
						}
					</div>
                )}
            </div>
        );
    })
);

export default TimelineItem;
