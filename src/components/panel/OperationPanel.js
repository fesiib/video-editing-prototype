import React from "react";

import { observer } from "mobx-react-lite";

import useRootContext from "../../hooks/useRootContext";

const OperationPanel = observer(function OperationPanel() {

	const { uiStore, domainStore } = useRootContext();

	const selectedOperation = domainStore.curIntent.editOperation;
	
	const selectedEdits = uiStore.timelineControls.selectedTimelineItems;

	const metaParameters = selectedEdits.reduce((acc, edit) => {
		for (let object of edit.adjustedObjects) {
			for (let objectKey of Object.keys(object.metaParameters)) {
				const curParameters = object.metaParameters[objectKey];
				for (let parameterKey of Object.keys(curParameters)) {
					const parameter = curParameters[parameterKey];
					if (parameter in acc[objectKey]) {
						acc[objectKey][parameter] = "mixed";
					}
					else {
						acc[objectKey][parameter] = parameter;
					}
				}
			}
		}
	}, {
		spatial: {},
		temporal: {},
		custom: {},
	});

	return (<div className="flex flex-col items-center p-1 m-1 border">
		<h2> Operation Panel</h2>
		{ selectedOperation === null ? 
			<div> No Operation Selected </div> : 
			<div> {
				Object.keys(metaParameters).map((key) => {
					const metaParameter = metaParameters[key];
					if (metaParameter !== null) {
						return (<div
							key={`metaParameter-${key}`}
						> {
							Object.keys(metaParameter).map((key) =>{
								const parameter = metaParameter[key];
								if (parameter !== null) {
									return (<div
										key={`parameter-${key}`}
									> {key}: {parameter} </div>);
								}
								return null;
							})
						} </div>)
					}	
				})
			
			} </div> 
		}
	</div>);
});

export default OperationPanel;