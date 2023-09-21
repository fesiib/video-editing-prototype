import React, { useEffect } from "react";

import { observer } from "mobx-react-lite";

import useRootContext from "../../hooks/useRootContext";

import { flattenObject } from "../../utilities/genericUtilities";
import ParameterControls from "./ParameterControls";

import CollapseIcon from "../../icons/CollapseIcon";
import UncollapseIcon from "../../icons/UncollapseIcon";
import { toJS } from "mobx";
import EditState from "../../stores/objects/editState";

import { AiOutlineBulb } from "react-icons/ai";
import { AiOutlineEdit } from "react-icons/ai";
import { BiTime } from "react-icons/bi";
import { PiFrameCorners } from "react-icons/pi";

const MetaKeyLabel = observer(function MetaKeyLabel({ metaKey }) {
	if (metaKey === "custom") {
		return (<div className="flex flex-row justify-start items-center gap-1">
			<AiOutlineEdit />
			<span className="text-sm font-bold"> Edit </span>
		</div>);
	}
	if (metaKey === "spatial") {
		return (<div className="flex flex-row justify-start items-center gap-1">
			<PiFrameCorners />
			<span className="text-sm font-bold"> Spatial </span>
		</div>);
	}
	if (metaKey === "temporal") {
		return (<div className="flex flex-row justify-start items-center gap-1">
			<BiTime />
			<span className="text-sm font-bold"> Temporal </span>
		</div>);
	}
	return null;
});

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
		// if (selectedOperation === null) {
			setCollapsed(true);
		} else {
			setCollapsed(false);
		}
	}, [selectedOperation, uiStore.canvasControls.sketching]);

	return (<div className="w-full">
		<button 
			className="w-full bg-gray-200 hover:bg-gray-300 flex flex-row gap-2 items-center"
			onClick={onTitleClick}
		>
			<div className="flex flex-row justify-start">
				{collapsed ? <CollapseIcon /> : <UncollapseIcon />}
				<span> Operation Panel </span>
			</div>
			{
				haveSuggested ? ( <AiOutlineBulb /> ) : null
			}
		</button>
		{
			collapsed ? null : (
				<div className={"flex flex-col justify-around p-2 border"
					+ (haveSuggested ? " bg-yellow-200 opacity-50" : " bg-gray-100")
				}>
					{ selectedOperation === null ? (
							<div className="italic text-gray-400"> Please select an operation </div>
						) : (<>
							{
								(selectedEdits.length === 0) ? (
									<div className="italic text-gray-400"> Please select an edit </div>
								) : (
									<div className="flex flex-col divide-y divide-gray-300 gap-2">
										{/* {
											(selectedSuggestedEdits.length !== 1 || domainStore.processingIntent
											) ? null : (
												<div className="flex flex-col justify-start px-1 divider-1">
													<div className="">
														<span className="text-sm"> Explanation: </span>
														<span className="text-bold text-sm"> {
															
															JSON.stringify(toJS(selectedEdits[0].explanation))
														} </span>
													</div>
													<div className="">
														<span className="text-sm"> Source: </span>
														<span className="text-bold text-sm"> {
															JSON.stringify(toJS(selectedEdits[0].suggestionSource))
														} </span>
													</div>
													{ domainStore.curIntent.editOperation === null ? null : (
														<div className="">
															<span className="text-sm"> Specifications: </span>
															<span className="text-bold text-sm">
																{
																	
																	selectedEdits[0].suggestedParameters[domainStore.curIntent.editOperationKey]?.length === 1 ?
																		JSON.stringify(toJS(selectedEdits[0].suggestedParameters[domainStore.curIntent.editOperationKey]))
																		: "None"
																}
															</span>
														</div>)
													}
												</div>
											)
										} */}
										<div className="flex flex-row"> {
											Object.keys(metaParameters).map((metaKey) => {
												const metaParameter = metaParameters[metaKey];
												if (metaParameter === null || Object.keys(metaParameter).length === 0) {
													return null;
												}
												let metaParameterKeys = Object.keys(metaParameter);
												if (metaKey === "custom") {
													metaParameterKeys = Object.keys(flattenObject(EditState.getCustomParameters(selectedOperation)));
													metaParameterKeys = metaParameterKeys.filter((key) => {
														return metaParameter[key] !== null && metaParameter[key] !== undefined;
													});
												}
												return (<div
													key={`metaParameter-${metaKey}`}
													className="flex flex-col mx-1"
												> 
												<MetaKeyLabel metaKey={metaKey} />
												{
													metaParameterKeys.map((parameterKey) => {
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
									</div>
								)
							}
						</>)
					}
				</div>
			)
		}
	</div>);
});

export default OperationPanel;