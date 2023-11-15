import React, { useEffect } from "react";

import { observer } from "mobx-react-lite";

import useRootContext from "../../hooks/useRootContext";

import DraggableText from "./DraggableText";
import DraggableImage from "./DraggableImage";
import SkippedConfig from "./SkippedConfig";
import CropConfig from "./CropConfig";
import BlurConfig from "./BlurConfig";
import DraggableShape from "./DraggableShape";
import ZoomConfig from "./ZoomConfig";
import { toJS } from "mobx";

const CanvasItem = observer(function CanvasItem({ item, stageRef, transformerRef, videoGroupRef, objectsGroupRef }) {
    const { uiStore, domainStore } = useRootContext();
	const type = item.parent.editOperationKey;
	const isVisible = item.isVisible(uiStore.timelineControls.playPosition);

	useEffect(() => {
		if (stageRef === null || transformerRef === null) {
			return;
		}
		let nodes = [];
		for (let nodeId of uiStore.canvasControls.transformerNodeIds) {
			const object = domainStore.curTab.getCanvasObjectById(nodeId);
			const node = stageRef.findOne(`#${nodeId}`);
			if (node === undefined) {
				continue;
			}
			if (object !== undefined &&
				object.isVisible(uiStore.timelineControls.playPosition)) {
				nodes.push(node);
			}
		}
		transformerRef.nodes(nodes);
	}, [
		isVisible,
	]);

	return (<>
		{type === uiStore.objectNames.text ? <DraggableText 
			curText={item} 
			stageRef={stageRef}
		/> : null}
		{type === uiStore.objectNames.image ? <DraggableImage
			curImage={item}
			stageRef={stageRef}
		/> : null}
		{type === uiStore.objectNames.shape ? <DraggableShape
			curShape={item} 
			transformerRef={transformerRef}
			stageRef={stageRef}
		/> : null}
		{type === uiStore.objectNames.cut ? <SkippedConfig skipped={item} /> : null}
		{type === uiStore.objectNames.crop ? <CropConfig 
			crop={item} 
			stageRef={stageRef}
		/> : null}
		{type === uiStore.objectNames.zoom ? <ZoomConfig
			zoom={item}
			videoGroupRef={videoGroupRef}
			objectsGroupRef={objectsGroupRef}
			stageRef={stageRef} 
		/> : null}
		{type === uiStore.objectNames.blur ? <BlurConfig blur={item} /> : null}
	</>);
});

export default CanvasItem;
