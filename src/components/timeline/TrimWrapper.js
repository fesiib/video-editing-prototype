import React from "react";

import { action } from "mobx";
import { observer } from "mobx-react-lite";

import { DndContext, PointerSensor, useDraggable, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToFirstScrollableAncestor, restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";

import TrimHandlerLeftIcon from "../../icons/TrimHandlerLeftIcon";
import TrimHandlerRightIcon from "../../icons/TrimHandlerRightIcon";
import useRootContext from "../../hooks/useRootContext";

const DraggableRangeHandle = observer(function DraggableRangeHandle({ scene, scenes, isLeftHandler }) {
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
		let leftUpperBound = 0;
		let rightLowerBound = null;
		for (let otherScene of scenes) {
            if (otherScene.commonState.id === scene.commonState.id) {
                continue;
            }
            if (otherScene.commonState.offset <= scene.commonState.offset) {
				leftUpperBound = Math.max(leftUpperBound, otherScene.commonState.end);
			}
			if (otherScene.commonState.end >= scene.commonState.end) {
				if (rightLowerBound === null) {
					rightLowerBound = otherScene.commonState.offset;
				}
				else {
					rightLowerBound = Math.min(rightLowerBound, otherScene.commonState.offset);
				}
			}
        }
		let transformSeconds = uiStore.pxToSec(adjustedTransform.x);
		const sceneDiv = document.getElementById(scene.commonState.id);
		if (isLeftHandler) {
			transformSeconds = Math.min(
				transformSeconds,
				scene.commonState.sceneDuration,
			);
            transformSeconds = Math.max(
				transformSeconds,
				leftUpperBound - scene.commonState.offset,
                -scene.commonState.start,  
            );
			console.log(transformSeconds, -scene.commonState.start, leftUpperBound - scene.commonState.offset);
			sceneDiv.style.transform = `translate3d(${uiStore.secToPx(
				scene.commonState.offset + transformSeconds
			)}px, ${0}px, ${0}px)`;
			sceneDiv.style.width = `${uiStore.secToPx(scene.commonState.sceneDuration - transformSeconds)}px`;
        } else {
			transformSeconds = Math.min(
				transformSeconds,
				scene.commonState.duration - scene.commonState.finish,
			);
			if (rightLowerBound !== null) {

				transformSeconds = Math.min(
					transformSeconds,
					rightLowerBound - scene.commonState.end,
				);
			}
            transformSeconds = Math.max(
				transformSeconds,
                -scene.commonState.sceneDuration,  
            );
			sceneDiv.style.width = `${uiStore.secToPx(scene.commonState.sceneDuration + transformSeconds)}px`;
        }
		adjustedTransform = {
			...adjustedTransform,
			x: uiStore.secToPx(transformSeconds),
		}
	}
    const style = {
        //transform: CSS.Transform.toString(adjustedTransform),
		backgroundColor: "grey",
		opacity: 0.5,
    };

    return (
        <div className="static" ref={setNodeRef} style={style} {...listeners} {...attributes}>
            <button className="my-auto"> {
				isLeftHandler ?
				<TrimHandlerLeftIcon /> :
				<TrimHandlerRightIcon/>
			} </button>
        </div>
    );
});

const TrimWrapper = observer(function TrimWrapper({ scene, scenes, children }) {
    const { uiStore } = useRootContext();

    const onHandlerDragEnd = action((event) => {
        const { active, delta } = event;
        const scene = active.data.current.scene;
        const isLeftHandler = active.data.current.isLeftHandler;
        let deltaSeconds = uiStore.pxToSec(delta.x);

		let leftUpperBound = 0;
		let rightLowerBound = null;
		for (let otherScene of scenes) {
            if (otherScene.commonState.id === scene.commonState.id) {
                continue;
            }
            if (otherScene.commonState.offset <= scene.commonState.offset) {
				leftUpperBound = Math.max(leftUpperBound, otherScene.commonState.end);
			}
			if (otherScene.commonState.end >= scene.commonState.end) {
				if (rightLowerBound === null) {
					rightLowerBound = otherScene.commonState.offset;
				}
				else {
					rightLowerBound = Math.min(rightLowerBound, otherScene.commonState.offset);
				}
			}
        }
        if (isLeftHandler) {
            deltaSeconds = Math.min(
				deltaSeconds,
				scene.commonState.sceneDuration,
			);
            deltaSeconds = Math.max(
				deltaSeconds,
				leftUpperBound - scene.commonState.offset,
                -scene.commonState.start,  
            );
            scene.commonState.start += deltaSeconds;
            scene.commonState.offset += deltaSeconds;
        } else {
            deltaSeconds = Math.min(
				deltaSeconds,
				scene.commonState.duration - scene.commonState.finish,
			);
			if (rightLowerBound !== null) {
				deltaSeconds = Math.min(
					deltaSeconds,
					rightLowerBound - scene.commonState.end,
				);
			}
            deltaSeconds = Math.max(
				deltaSeconds,
                -scene.commonState.sceneDuration,  
            );
            scene.commonState.finish += deltaSeconds;
        }
    });

    return (
        <>
            <DndContext
                sensors={useSensors(useSensor(PointerSensor))}
                modifiers={[restrictToHorizontalAxis, restrictToFirstScrollableAncestor]}
                onDragEnd={onHandlerDragEnd}
            >
                <DraggableRangeHandle scene={scene} scenes={scenes} isLeftHandler={true} />
                {children}
                <DraggableRangeHandle scene={scene} scenes={scenes} isLeftHandler={false} />
            </DndContext>
        </>
    );
});

export default TrimWrapper;
