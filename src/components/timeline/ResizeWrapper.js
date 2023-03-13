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

const ResizeWrapper = observer(function ResizeWrapper({ scene, children }) {
    const { uiStore } = useRootContext();

    const onHandlerDragEnd = action((event) => {
        const { active, delta } = event;
        const scene = active.data.current.scene;
        const isLeftHandler = active.data.current.isLeftHandler;
        if (isLeftHandler) {
            scene.commonState.start += uiStore.pxToSec(delta.x);
			scene.commonState.offset += uiStore.pxToSec(delta.x);
            scene.commonState.duration += -uiStore.pxToSec(delta.x);
        } else {
            scene.commonState.duration += uiStore.pxToSec(delta.x);
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

export default ResizeWrapper;
