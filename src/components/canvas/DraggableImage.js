import React, { useEffect, useMemo, useRef, useState } from "react";

import { observer } from "mobx-react-lite";
import { action } from "mobx";

import { Image } from "react-konva";

import useRootContext from "../../hooks/useRootContext";

import { adaptCoordinate } from "../../utilities/genericUtilities";

const DraggableImage = observer(function DraggableImage({ curImage }) {
    const { uiStore, domainStore } = useRootContext();

    const imageRef = useRef(null);

    const [isSelected, setIsSelected] = useState(false);

    const isVisible = curImage.commonState.isVisible(uiStore.timelineControls.playPosition);

	const canvasWidth = uiStore.canvasSize.width;
	const canvasHeight = uiStore.canvasSize.height;
	const projectWidth = domainStore.projectMetadata.width;
    const projectHeight = domainStore.projectMetadata.height;

	const x = adaptCoordinate(curImage.commonState.x, curImage.commonState.width, projectWidth, canvasWidth);
	const y = adaptCoordinate(curImage.commonState.y, curImage.commonState.height, projectHeight, canvasHeight);

	const imageObject = useMemo(() => {
        const element = document.createElement("img");
        element.src = curImage.customParameters.source;
        element.id = "image_element_" + curImage.commonState.id;
        return element;
    }, [curImage.source, curImage.commonState.id]);;

    useEffect(action(() => {
		if (!isVisible) {
			uiStore.removeSelectedCanvasObject(imageRef.current.id());
		}
		else if (
			uiStore.timelineControls.selectedTimelineItems.findIndex(
				(item) => (item.commonState.id === imageRef.current.id())
			) >= 0
			&& 	uiStore.timelineControls.selectedTimelineItems.length === 1
		) {
			uiStore.addSelectedCanvasObject(imageRef.current.id());
		}
    }), [
		isVisible,
		uiStore.timelineControls.selectedTimelineItems,
	]);

    useEffect(action(() => {
		setIsSelected(uiStore.canvasControls.transformerNodeIds.indexOf(imageRef.current.id()) >= 0);
    }), [
		uiStore.canvasControls.transformerNodeIds
	]);


    return (<>
		<Image
			id={curImage.commonState.id}
            name={uiStore.objectNames.text}
            ref={imageRef}
            image={imageObject}
			//crop={curImage.customParameters.crop}
            x={x}
            y={y}
            width={curImage.commonState.width}
            height={curImage.commonState.height}
            offsetX={curImage.commonState.width / 2}
            offsetY={curImage.commonState.height / 2}
            scaleX={curImage.commonState.scaleX}
            scaleY={curImage.commonState.scaleY}
			rotation={curImage.commonState.rotation}
            draggable={isSelected}
            visible={isVisible}
            perfectDrawEnabled={false}
            onDragMove={action((event) => curImage.commonState.onDragMove(event.target))}
            onTransform={action((event) => curImage.commonState.onTransform(event.target))}
        />
	</>
    );
});

export default DraggableImage;