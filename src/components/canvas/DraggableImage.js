import React, { useEffect, useMemo, useRef, useState } from "react";

import { observer } from "mobx-react-lite";
import { action } from "mobx";

import { Image } from "react-konva";

import useRootContext from "../../hooks/useRootContext";

import { adaptCoordinate } from "../../utilities/genericUtilities";

const DraggableImage = observer(function DraggableImage({ curImage }) {
	const { uiStore, domainStore } = useRootContext();

	const imageTitleConst = domainStore.editOperations[uiStore.objectNames.image].title;

    const imageRef = useRef(null);

    const [isSelected, setIsSelected] = useState(false);

    const isVisible = curImage.isVisible(uiStore.timelineControls.playPosition);
	const isSuggested = curImage.isSuggested;

	const canvasWidth = uiStore.canvasSize.width;
	const canvasHeight = uiStore.canvasSize.height;
	const projectWidth = domainStore.projectMetadata.width;
    const projectHeight = domainStore.projectMetadata.height;

	const x = adaptCoordinate(curImage.commonState.x, curImage.commonState.width, projectWidth, canvasWidth);
	const y = adaptCoordinate(curImage.commonState.y, curImage.commonState.height, projectHeight, canvasHeight);

	// const imageObject = useMemo(() => {
    //     const element = document.createElement("img");
    //     element.src = curImage.customParameters.source;
    //     element.id = "image_element_" + curImage.commonState.id;
    //     return element;
    // }, [curImage.customParameters.source, curImage.commonState.id]);


	const imageObject = useMemo(() => {
        const element = new window.Image();
    	element.src = curImage.customParameters.source;
		element.id = "image_element_" + curImage.commonState.id;
        return element;
    }, [curImage.customParameters.source, curImage.commonState.id]);
	

    useEffect(action(() => {
		if (imageRef.current === null) {
			return;
		}
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
		uiStore.timelineControls.selectedTimelineItems.length,
	]);

    useEffect(action(() => {
		if (imageRef.current === null) {
			return;
		}
		setIsSelected(uiStore.canvasControls.transformerNodeIds.indexOf(imageRef.current.id()) >= 0);
    }), [
		JSON.stringify(uiStore.canvasControls.transformerNodeIds)
	]);


    return curImage.title !== imageTitleConst ? null : (<>
		<Image
			id={curImage.commonState.id}
            name={uiStore.objectNames.image}
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
			// crop={curImage.commonState.cropped ? {
			// 	x: curImage.commonState.cropX,
			// 	y: curImage.commonState.cropY,
			// 	width: curImage.commonState.cropWidth,
			// 	height: curImage.commonState.cropHeight,
			// } : null}
			//opacity={isSuggested ? 0.5 : 1}
			rotation={curImage.commonState.rotation}
            draggable={isSelected && !isSuggested}
            visible={isVisible}
            perfectDrawEnabled={false}
            onDragMove={action((event) => curImage.commonState.onDragMove(event.target))}
            onTransform={action((event) => curImage.commonState.onTransform(event.target))}
			onTransformEnd={action((event) => {
				uiStore.logData("canvasObjectTransformed", {
					id: curImage.commonState.id,
					objectType: "image",
				});
			})}
			onDragEnd={action((event) => {
				uiStore.logData("canvasObjectDragged", {
					id: curImage.commonState.id,
					objectType: "image",
				});
			})}
        />
	</>);
});

export default DraggableImage;