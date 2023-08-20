import React from "react";

import { observer } from "mobx-react-lite";

import useRootContext from "../../hooks/useRootContext";

import { flattenObject } from "../../utilities/genericUtilities";
import ParameterControls from "./ParameterControls";

const OperationPanel = observer(function OperationPanel() {

	const { uiStore, domainStore } = useRootContext();

	const selectedOperation = domainStore.curIntent.editOperation;
	
	const selectedEdits = uiStore.timelineControls.selectedTimelineItems;

	const metaParameters = selectedEdits.reduce((acc, edit) => {
		for (let metaKey of Object.keys(edit.metaParameters)) {
			const parameters = flattenObject(edit.metaParameters[metaKey]);
			for (let parameterKey of Object.keys(parameters)) {
				if (selectedEdits.length > 1
					&& domainStore.skipParameterIfMultiple.includes(parameterKey)) {
					continue;
				}
				if (parameterKey in acc[metaKey]) {
					acc[metaKey][parameterKey] = "mixed";
				}
				else {
					acc[metaKey][parameterKey] = parameters[parameterKey];
				}
			}
		}
		return acc;
	}, {
		custom: {},
		spatial: {},
		temporal: {},
	});
	return (<div className="flex flex-col items-center p-2 border">
		<h2> Operation Panel</h2>
		{ selectedOperation === null ? 
			<div> No Operation Selected </div> : 
			<div> {
				Object.keys(metaParameters).map((metaKey) => {
					const metaParameter = metaParameters[metaKey];
					if (metaParameter === null || Object.keys(metaParameter).length === 0) {
						return null;
					}
					return (<div
						key={`metaParameter-${metaKey}`}
						className="flex flex-col pb-2 border-t-2"
					> 
					<span
						className="font-bold text-left text-xs px-2"
					> {metaKey} </span> 
					{
						Object.keys(metaParameter).map((parameterKey) => {
							const parameter = metaParameter[parameterKey];
							if (parameter !== null) {
								return (<ParameterControls 
									key={`parameter-${metaKey}-${parameterKey}`}
									metaKey={metaKey}
									parameterKey={parameterKey}
									parameter={parameter}
								/>);
							}
							return null;
						})
					} </div>);
				})
			} </div> 
		}
	</div>);
});

export default OperationPanel;