import React, { useEffect, useRef, useState } from "react";

import { action } from "mobx";
import { observer } from "mobx-react-lite";

import { Text } from "react-konva";

import useRootContext from "../../hooks/useRootContext";

const DraggableText = observer(function DraggableText({ curText, transformerRef }) {
    const { uiStore } = useRootContext();

    const textRef = useRef(null);
    const [isSelected, setIsSelected] = useState(false);

    const onTextDragEnd = action((event) => {
        curText.x = event.target.x();
        curText.y = event.target.y();
    });

    const onTransformerEnd = action((event) => {
        curText.scaleX = event.target.scaleX();
        curText.scaleY = event.target.scaleY();
        curText.x = event.target.x();
        curText.y = event.target.y();
    });

    useEffect(() => {
        if (!isSelected) {
            transformerRef.current.detach();
            transformerRef.current.off("transformend");
        } else {
            transformerRef.current.nodes([textRef.current]);
            transformerRef.current.on("transformend", onTransformerEnd);
        }
        transformerRef.current.getLayer().batchDraw();
    }, [isSelected, transformerRef]);

    return (
        <Text
            ref={textRef}
			text={curText.content}
			{...curText.textStyle}
            x={curText.x}
            y={curText.y}
            width={curText.width}
            height={curText.height}
            offsetX={curText.width / 2}
            offsetY={curText.height / 2}
            scaleX={curText.scaleX}
            scaleY={curText.scaleY}
            draggable={isSelected}
            onDblClick={() => setIsSelected(!isSelected)}
            onDragEnd={onTextDragEnd}
            perfectDrawEnabled={false}
        />
    );
});

export default DraggableText;
