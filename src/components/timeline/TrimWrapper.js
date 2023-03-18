import React from "react";

import { action } from "mobx";
import { observer } from "mobx-react-lite";

import { DndContext, PointerSensor, useDraggable, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToFirstScrollableAncestor, restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";

import useRootContext from "../../hooks/useRootContext";

const DraggableRangeHandle = observer(function DraggableRangeHandle({ scene, isLeftHandler }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
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

    const style = {
        transform: CSS.Transform.toString(transform),
    };

    return (
        <div className="static" ref={setNodeRef} {...listeners} {...attributes} style={style}>
            <button> {isLeftHandler ? "L" : "R"} </button>
        </div>
    );
});

const TrimWrapper = observer(function TrimWrapper({ scene, children }) {
    const { uiStore } = useRootContext();

    const onHandlerDragEnd = action((event) => {
        const { active, delta } = event;
        const scene = active.data.current.scene;
        const isLeftHandler = active.data.current.isLeftHandler;
        let deltaSeconds = uiStore.pxToSec(delta.x);
        if (isLeftHandler) {
            deltaSeconds = Math.max(
                -scene.commonState.start,
                Math.min(deltaSeconds, scene.commonState.sceneDuration)
            );
            scene.commonState.start += deltaSeconds;
            scene.commonState.offset += deltaSeconds;
        } else {
            deltaSeconds = Math.max(
                -scene.commonState.sceneDuration,
                Math.min(deltaSeconds, scene.commonState.duration - scene.commonState.finish)
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
                <DraggableRangeHandle scene={scene} isLeftHandler={true} />
                {children}
                <DraggableRangeHandle scene={scene} isLeftHandler={false} />
            </DndContext>
        </>
    );
});

export default TrimWrapper;
