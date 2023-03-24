import React, { forwardRef } from "react";

import { observer } from "mobx-react-lite";

import useRootContext from "../../hooks/useRootContext";

import TrimWrapper from "./TrimWrapper";
import { action } from "mobx";

export const TimelineItem = observer(
    forwardRef(function TimelineItem({ scene, scenes, transform, isOverlay, attributes, listeners, ...props }, ref) {
        const { uiStore } = useRootContext();

		const lowLabel = scene.lowLabel;

		const highLabel = scene.highLabel;

		let showHighLabel = scenes.findIndex((value) => (
			value.commonState.end === scene.commonState.offset
			&& value.highLabel === scene.highLabel
		)) < 0;

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

		const onHighLabelClick = action((event) => {
			event.stopPropagation();
			event.preventDefault();
			let newSelectedTimelineItems = [];
			for (let someScene of scenes) {
				const someHighLabel = (someScene.commonState.thumbnails.length > 1 ?
					someScene.commonState.thumbnails[1] : "None");
				if (someScene.commonState.offset >= scene.commonState.offset
					&& someHighLabel === highLabel
				) {
					newSelectedTimelineItems.push(someScene);
				}
			}
			newSelectedTimelineItems.sort((p1, p2) => p1.commonState.offset - p2.commonState.offset);
			let lastEnd = scene.commonState.offset;
			let contSelectedTimelineItems = [];
			for (let selectedScene of newSelectedTimelineItems) {
				if (selectedScene.commonState.offset != lastEnd) {
					break;
				}
				contSelectedTimelineItems.push(selectedScene);
				lastEnd = selectedScene.commonState.end;
			}
			uiStore.timelineControls.selectedTimelineItems = contSelectedTimelineItems;
		});
        return (
            <div
                className={ (isSelected ?
					"absolute bottom-0 z-10 border border-red-400" :
					"absolute bottom-0 z-10 border" ) +
					( showHighLabel ? " divide-x-2 divide-black" : "")
				}
                ref={ref}
                style={style}
				{...attributes}
				{...listeners}
                {...props}
            >
				
                { isOverlay ? (<span>
					{uiStore.timelineControls.selectedTimelineItems.length > 1 ? 
						uiStore.timelineControls.selectedTimelineItems.length + " scenes" :
						"1 scene"
					}
				</span>
                ) : (<>
					{ showHighLabel ?
						(<div 
							className="h-6 px-2 bg-black text-white absolute -top-6 left-0 overflow-hidden"
							onClick={onHighLabelClick}
						>
								{highLabel}
						</div>) : null
					}
					<div className="flex justify-between">
						<TrimWrapper 
							scene={scene}
							scenes={scenes}
						>
							<span id={"label_" + scene.commonState.id}>
								{ !willOverflow ? lowLabel : "" }
							</span>
						</TrimWrapper>
						{/* <span className="grow"> {lowLabel} </span> */}
					</div>
				</>)}
            </div>
        );
    })
);

export default TimelineItem;
