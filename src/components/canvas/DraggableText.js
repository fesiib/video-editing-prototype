import React, { useEffect, useRef, useState } from "react";

import { observer } from "mobx-react-lite";

import { Text } from "react-konva";

import useRootContext from "../../hooks/useRootContext";

const DraggableText = observer(function DraggableText({ curText }) {
    const { uiStore } = useRootContext();

    const textRef = useRef(null);

    const [isSelected, setIsSelected] = useState(false);

    const left = curText.commonState.offset;
    const right = curText.commonState.end;
    const isVisible =
        left <= uiStore.timelineControls.playPosition &&
        right > uiStore.timelineControls.playPosition;

    useEffect(() => {
        setIsSelected(uiStore.canvasControls.transformerNodes.indexOf(textRef.current) >= 0);
    }, [uiStore.canvasControls.transformerNodes]);
    return (
        <Text
            name={uiStore.objectNames.text}
            ref={textRef}
            text={curText.customParameters.content}
            {...curText.customParameters.style}
            x={curText.commonState.x}
            y={curText.commonState.y}
            width={curText.commonState.width}
            height={curText.commonState.height}
            offsetX={curText.commonState.width / 2}
            offsetY={curText.commonState.height / 2}
            scaleX={curText.commonState.scaleX}
            scaleY={curText.commonState.scaleY}
            draggable={isSelected}
            visible={isVisible}
            perfectDrawEnabled={false}
            onDragEnd={(event) => curText.commonState.onDragEnd(event.target)}
            onTransformEnd={(event) => curText.commonState.onTransformerEnd(event.target)}
        />
    );
});

export default DraggableText;
