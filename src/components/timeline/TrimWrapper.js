import React from "react";

import { action } from "mobx";
import { observer } from "mobx-react-lite";

import { DndContext, PointerSensor, useDraggable, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToFirstScrollableAncestor, restrictToHorizontalAxis } from "@dnd-kit/modifiers";

import TrimHandlerLeftIcon from "../../icons/TrimHandlerLeftIcon";
import TrimHandlerRightIcon from "../../icons/TrimHandlerRightIcon";
import useRootContext from "../../hooks/useRootContext";
import { playPositionToFormat } from "../../utilities/timelineUtilities";

const DraggableRangeHandle = observer(function DraggableRangeHandle({
    scene,
    isLeftHandler,
	showHandlers,
}) {
    const { uiStore } = useRootContext();

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: scene.commonState.id + (isLeftHandler ? "leftHandler" : "rightHandler"),
        transition: {
            duration: 150, // milliseconds
            easing: "cubic-bezier(0.25, 1, 0.5, 1)",
        },
        data: {
            scene,
            isLeftHandler,
        },
    });

    let adjustedTransform = {
        ...transform,
    };

    if (isDragging && typeof adjustedTransform?.x === "number") {
        let transformSeconds = uiStore.pxToSec(adjustedTransform.x);
        const sceneDiv = document.getElementById(scene.commonState.id);
        const labelDiv = document.getElementById("label_" + scene.commonState.id);
        const positionIndicatorDiv = document.getElementById(
            uiStore.timelineConst.positionIndicatorId
        );
        const positionIndicatorLabelDiv = document.getElementById(
            uiStore.timelineConst.positionIndicatorLabelId
        );
        const lowLabel = scene.intent === undefined ?
			(scene.commonState.thumbnails.length > 0 ? scene.commonState.thumbnails[0] : "")
			: scene.intent.editOperationKey;

        if (isLeftHandler) {
            transformSeconds = Math.min(transformSeconds, scene.commonState.sceneDuration - uiStore.timelineConst.minTimelineItemDuration);
            transformSeconds = Math.max(
                transformSeconds,
                scene.leftTimelineLimit - scene.commonState.offset,
                -scene.commonState.start
            );
            sceneDiv.style.transform = `translate3d(${uiStore.secToPx(
                scene.commonState.offset + transformSeconds
            )}px, ${0}px, ${0}px)`;
            sceneDiv.style.width = `${uiStore.secToPx(
                scene.commonState.sceneDuration - transformSeconds
            )}px`;

            if (
                uiStore.secToPx(scene.commonState.sceneDuration - transformSeconds) <
                uiStore.timelineConst.minTimelineItemWidthPx
            ) {
                labelDiv.innerHTML = "";
            } else {
                labelDiv.innerHTML = lowLabel;
            }

            if (positionIndicatorDiv) {
                positionIndicatorDiv.style.transform = `translate3d(${uiStore.secToPx(
                    scene.commonState.offset + transformSeconds
                )}px, ${0}px, ${0}px)`;
            }
            if (positionIndicatorLabelDiv) {
                positionIndicatorLabelDiv.innerHTML = playPositionToFormat(
                    scene.commonState.offset + transformSeconds
                );
            }
        } else {
            transformSeconds = Math.min(
                transformSeconds,
                scene.commonState.duration - scene.commonState.finish
            );
            transformSeconds = Math.min(
				transformSeconds,
				scene.rightTimelineLimit - scene.commonState.end
			);
            transformSeconds = Math.max(transformSeconds, -scene.commonState.sceneDuration + uiStore.timelineConst.minTimelineItemDuration);

            sceneDiv.style.width = `${uiStore.secToPx(
                scene.commonState.sceneDuration + transformSeconds
            )}px`;

            if (
                uiStore.secToPx(scene.commonState.sceneDuration + transformSeconds) <
                uiStore.timelineConst.minTimelineItemWidthPx
            ) {
                labelDiv.innerHTML = "";
            } else {
                labelDiv.innerHTML = lowLabel;
            }

            if (positionIndicatorDiv) {
                positionIndicatorDiv.style.transform = `translate3d(${uiStore.secToPx(
                    scene.commonState.end + transformSeconds
                )}px, ${0}px, ${0}px)`;
            }
            if (positionIndicatorLabelDiv) {
                positionIndicatorLabelDiv.innerHTML = playPositionToFormat(
                    scene.commonState.end + transformSeconds
                );
            }
        }
        adjustedTransform = {
            ...adjustedTransform,
            x: uiStore.secToPx(transformSeconds),
        };
    }
    const style = {
        //transform: CSS.Transform.toString(adjustedTransform),
        //backgroundColor: "grey",
        //opacity: 0.5,
    };

    return (
        <div 
			className="flex"
			//style={style}
			ref={setNodeRef}
			{...listeners}
			{...attributes}
		>
            <button className={(showHandlers || isDragging) ? 
				"w-2 h-full  bg-gray-200 rounded" : ""
			}>
                {/* {" "}{isLeftHandler ? <TrimHandlerLeftIcon /> : <TrimHandlerRightIcon />}{" "} */}
            </button>
        </div>
    );
});

const TrimWrapper = observer(function TrimWrapper({ 
	scene, children,
	showHandlers,
}) {
    const { uiStore } = useRootContext();

    const onHandlerDragStart = action((event) => {
        const { active } = event;
        uiStore.timelineControls.positionIndicatorVisibility += 1;
        const { isLeftHandler, scene } = active.data.current;
        if (isLeftHandler) {
            uiStore.timelineControls.positionIndicatorSec = scene.commonState.offset;
        } else {
            uiStore.timelineControls.positionIndicatorSec = scene.commonState.end;
        }
    });

    const onHandlerDragEnd = action((event) => {
        const { active, delta } = event;
        const scene = active.data.current.scene;
        const isLeftHandler = active.data.current.isLeftHandler;
        let deltaSeconds = uiStore.pxToSec(delta.x);

        if (isLeftHandler) {
            deltaSeconds = Math.min(deltaSeconds, scene.commonState.sceneDuration);
            deltaSeconds = Math.max(
                deltaSeconds,
                scene.leftTimelineLimit - scene.commonState.offset,
                -scene.commonState.start
            );
			scene.commonState.setMetadata({
				offset: scene.commonState.offset + deltaSeconds,
				start: scene.commonState.start + deltaSeconds,
			});
        } else {
			deltaSeconds = Math.min(
                deltaSeconds,
                scene.commonState.duration - scene.commonState.finish
            );
			deltaSeconds = Math.min(deltaSeconds, scene.rightTimelineLimit - scene.commonState.end);
            deltaSeconds = Math.max(deltaSeconds, -scene.commonState.sceneDuration);
			scene.commonState.setMetadata({
				finish: scene.commonState.finish + deltaSeconds,
			});
        }
        uiStore.timelineControls.positionIndicatorVisibility -= 1;
		uiStore.logData("timelineEditTrimmed", {
			editId: scene.commonState.id,
			sceneDuration: scene.commonState.sceneDuration,
			delta: deltaSeconds,
			isLeftHandler: isLeftHandler,
		});
    });

    return (
        <>
            <DndContext
                sensors={useSensors(useSensor(PointerSensor))}
                modifiers={[restrictToHorizontalAxis, restrictToFirstScrollableAncestor]}
                onDragStart={onHandlerDragStart}
                onDragEnd={onHandlerDragEnd}
            >
                <DraggableRangeHandle
					scene={scene} isLeftHandler={true}
					showHandlers={showHandlers} 
				/>
                {children}
                <DraggableRangeHandle 
					scene={scene} isLeftHandler={false} 
					showHandlers={showHandlers}
				/>
            </DndContext>
        </>
    );
});

export default TrimWrapper;
