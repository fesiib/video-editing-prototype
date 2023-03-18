import React, { useEffect, useRef, useState } from "react";

import { action } from "mobx";
import { observer } from "mobx-react-lite";

import { Text } from "react-konva";

import useRootContext from "../../hooks/useRootContext";

const DraggableText = observer(function DraggableText({ curText }) {
    const { uiStore } = useRootContext();

    const textRef = useRef(null);

    const [isSelected, setIsSelected] = useState(false);

    useEffect(() => {
        setIsSelected(uiStore.canvasControls.transformerNodes.indexOf(textRef.current) >= 0);
    }, [uiStore.canvasControls.transformerNodes]);

    return (
        <Text
            name={uiStore.objectNames.text}
            ref={textRef}
            text={curText.content}
            {...curText.textStyle}
            x={curText.commonState.x}
            y={curText.commonState.y}
            width={curText.commonState.width}
            height={curText.commonState.height}
            offsetX={curText.commonState.width / 2}
            offsetY={curText.commonState.height / 2}
            scaleX={curText.commonState.scaleX}
            scaleY={curText.commonState.scaleY}
            draggable={isSelected}
            perfectDrawEnabled={false}
            onDragEnd={(event) => curText.commonState.onDragEnd(event.target)}
            onTransformEnd={(event) => curText.commonState.onTransformerEnd(event.target)}
        />
    );
});

export default DraggableText;
