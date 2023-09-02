import React, { useEffect } from "react";

import { observer } from "mobx-react-lite";

import useRootContext from "../../hooks/useRootContext";

import { flattenObject } from "../../utilities/genericUtilities";
import ParameterControls from "./ParameterControls";

import CollapseIcon from "../../icons/CollapseIcon";
import UncollapseIcon from "../../icons/UncollapseIcon";

const OperationPanel = observer(function OperationPanel() {

	const { uiStore, domainStore } = useRootContext();

	const selectedOperation = domainStore.curIntent.editOperation;
	const [collapsed, setCollapsed] = React.useState(false);
	
	const selectedEdits = uiStore.timelineControls.selectedTimelineItems;

	const haveSuggested = selectedEdits.some((edit) => edit.isSuggested);

	const metaParameters = selectedEdits.reduce((acc, edit) => {
		for (let metaKey of Object.keys(edit.metaParameters)) {
			const parameters = flattenObject(edit.metaParameters[metaKey]);
			for (let parameterKey of Object.keys(parameters)) {
				if (selectedEdits.length > 1
					&& domainStore.skipParameterIfMultiple.includes(parameterKey)) {
					continue;
				}
				if (parameterKey in acc[metaKey]) {
					if (acc[metaKey][parameterKey] !== parameters[parameterKey]) {
						acc[metaKey][parameterKey] = "mixed";
					}
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

	const onTitleClick = () => {
		setCollapsed(() => !collapsed);
	}

	useEffect(() => {
		if (selectedOperation === null || uiStore.canvasControls.sketching) {
			setCollapsed(true);
		} else {
			setCollapsed(false);
		}
	}, [selectedOperation, uiStore.canvasControls.sketching]);

	return (<div className="w-full">
		<button className="flex flex-row justify-start w-full bg-gray-200 hover:bg-gray-300" onClick={onTitleClick}>
			{collapsed ? <CollapseIcon /> : <UncollapseIcon />}
			<span> Operation Panel </span>
		</button>
		{
			collapsed ? null : (
				<div className={"flex flex-col justify-around p-2 border"
					+ (haveSuggested ? " bg-green-200 opacity-50" : " bg-gray-100")
				}>
					{ selectedOperation === null || uiStore.timelineControls.selectedTimelineItems.length === 0 ? 
						null : (
							<div className="flex flex-row justify-around">
								<div
									key={`metaParameter-${"custom"}`}
									className="flex flex-col mx-1"
								> 
								{/* <span
									className="font-bold text-left text-xs px-2"
								> {selectedOperation.title} </span>  */}
									{
										Object.keys(metaParameters.custom).map((parameterKey) => {
											const parameter = metaParameters.custom[parameterKey];
											if (parameter !== null) {
												return (<ParameterControls 
													key={`parameter-${"custom"}-${parameterKey}`}
													metaKey={"custom"}
													parameterKey={parameterKey}
													parameter={parameter}
												/>);
											}
											return null;
										})
									}
								</div>
								<div className="flex flex-col">
									<div
										key={`metaParameter-${"spatial"}`}
										className="flex flex-col mx-1"
									> 
									<span
										className="font-bold text-left text-xs px-2"
									> {"Coordinates"} </span> 
										{
											Object.keys(metaParameters.spatial).map((parameterKey) => {
												const parameter = metaParameters.spatial[parameterKey];
												if (parameter !== null) {
													return (<ParameterControls 
														key={`parameter-${"spatial"}-${parameterKey}`}
														metaKey={"spatial"}
														parameterKey={parameterKey}
														parameter={parameter}
													/>);
												}
												return null;
											})
										}
									</div>
									<div
										key={`metaParameter-${"temporal"}`}
										className="flex flex-col mx-1"
									> 
									<span
										className="font-bold text-left text-xs px-2"
									> {"Time"} </span> 
										{
											Object.keys(metaParameters.temporal).map((parameterKey) => {
												const parameter = metaParameters.temporal[parameterKey];
												if (parameter !== null) {
													return (<ParameterControls 
														key={`parameter-${"temporal"}-${parameterKey}`}
														metaKey={"temporal"}
														parameterKey={parameterKey}
														parameter={parameter}
													/>);
												}
												return null;
											})
										}
									</div>
								</div>
							</div>
						)
						// <div className="flex flex-row"> {
						// 	Object.keys(metaParameters).map((metaKey) => {
						// 		const metaParameter = metaParameters[metaKey];
						// 		if (metaParameter === null || Object.keys(metaParameter).length === 0) {
						// 			return null;
						// 		}
						// 		return (<div
						// 			key={`metaParameter-${metaKey}`}
						// 			className="flex flex-col mx-1"
						// 		> 
						// 		<span
						// 			className="font-bold text-left text-xs px-2"
						// 		> {metaKey} </span> 
						// 		{
						// 			Object.keys(metaParameter).map((parameterKey) => {
						// 				const parameter = metaParameter[parameterKey];
						// 				if (parameter !== null) {
						// 					return (<ParameterControls 
						// 						key={`parameter-${metaKey}-${parameterKey}`}
						// 						metaKey={metaKey}
						// 						parameterKey={parameterKey}
						// 						parameter={parameter}
						// 					/>);
						// 				}
						// 				return null;
						// 			})
						// 		} </div>);
						// 	})
						// } </div> 
					}
				</div>
			)
		}
	</div>);
});

export default OperationPanel;