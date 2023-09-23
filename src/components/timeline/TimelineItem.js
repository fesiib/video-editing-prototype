import React, { forwardRef, useState } from "react";

import { observer } from "mobx-react-lite";

import useRootContext from "../../hooks/useRootContext";

import TrimWrapper from "./TrimWrapper";

import { AiOutlineBulb } from "react-icons/ai";
import { MdFormatColorText } from "react-icons/md";
import { BiImageAlt } from "react-icons/bi";
import { CgShapeSquare } from "react-icons/cg";
import { RiScissors2Fill } from "react-icons/ri";
import { BiSolidCrop } from "react-icons/bi";
import { TbZoomPan } from "react-icons/tb";
import { MdLensBlur } from "react-icons/md";

export const TimelineItem = observer(
    forwardRef(function TimelineItem(
        { itemType, scene, scenes, transform, attributes, listeners, ...props },
        ref
    ) {
        const { uiStore, domainStore } = useRootContext();

		const operationIcons = {
			"text": <MdFormatColorText />,
			"image": <BiImageAlt />,
			"shape": <CgShapeSquare />,
			"cut": <RiScissors2Fill />,
			"crop": <BiSolidCrop />,
			"zoom": <TbZoomPan />,
			"blur": <MdLensBlur />,
		};

		const [hovering, setHovering] = useState(false);

        const lowLabel = scene.intent === undefined ?
        	(scene.commonState.thumbnails.length > 0 ? scene.commonState.thumbnails[0] : "")
			: scene.intent.editOperationKey;

		const isOverlay = itemType === "overlay";
		const isMain = itemType === "main";
		const isSkipped = itemType === "skipped";
		const isSuggested = itemType === "suggested";

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
			borderWidth: (isMain || isSkipped) ? "1px" : (
				isSelected ? "2px" : "1px"),
            borderColor: (isMain || isSkipped) ? "black" : uiStore.editColorPalette[lowLabel],
			opacity: isOverlay ? 0.8 : 1,
        };

		let outerClassName = "";
		let innerClassName = "";

		if (isMain) {
			outerClassName = "absolute bottom-1/2 z-10 drop-shadow-xl";
			innerClassName = "h-5 bg-slate-100";
		}
		else if (isSkipped) {
			outerClassName = "absolute bottom-1/2 z-10";
			innerClassName = "h-5 bg-gray-500";
		}
		else if (isSuggested) {
			outerClassName = (isSelected
				? "absolute top-1/2 z-20 brightness-50"
				: "absolute top-1/2 z-20 ");
			innerClassName = "h-5 bg-yellow-300 flex flex-row justify-center items-center";
		}
		else if (isOverlay) {
			outerClassName = ("absolute z-10 brightness-75");
			innerClassName = "h-5 bg-green-300 flex flex-row justify-center items-center";
		}
		else {
			outerClassName = (isSelected
				? "absolute bottom-1/2 z-10 brightness-75"
				: "absolute bottom-1/2 z-10 ");
			innerClassName = "h-5 bg-green-300 flex flex-row justify-between";
		}

        return (
            <div
                className={outerClassName}
                ref={ref}
                style={style}
                {...attributes}
                {...listeners}
                {...props}
				onMouseEnter={(event) => {
					setHovering(() => true);
					if (props.onMouseEnter !== undefined 
						&& props.onMouseEnter !== null
						&& typeof props.onMouseEnter === "function"
					) {
						props.onMouseEnter(event);
					}
				}}
				onMouseLeave={(event) => {
					setHovering(() => false);
					if (props.onMouseLeave !== undefined 
						&& props.onMouseLeave !== null
						&& typeof props.onMouseLeave === "function"
					) {
						props.onMouseLeave(event);
					}
				}}
            >
                {isOverlay ? (
					<div className={
						innerClassName
					}>
						<span className="">
							{uiStore.timelineControls.selectedTimelineItems.length > 1
								? uiStore.timelineControls.selectedTimelineItems.length + " scenes"
								: "1 scene"}
						</span>
					</div>
                ) : (
					<div className={innerClassName}>
						{ (isMain || isSkipped || isSuggested) ? null
							: (
								<TrimWrapper 
									showHandlers={hovering || isSelected}
									scene={scene} scenes={scenes}
								>
									<span 
										className={"h-5 align-top flex items-center font-bold"}
										id={"label_" + scene.commonState.id}
									>
										{!willOverflow ? lowLabel : ("")}
									</span>
								</TrimWrapper>
							)
						}
						{isSuggested ? (
							<span 
								className={"h-5 align-top flex items-center"}
								id={"label_" + scene.commonState.id}
							>
								{!willOverflow ? lowLabel : ("")}
							</span>
						) : null}
					</div>
                )}
            </div>
        );
    })
);

export default TimelineItem;
