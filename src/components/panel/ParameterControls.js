import React from 'react';

import { observer } from "mobx-react-lite";

import useRootContext from "../../hooks/useRootContext";

import { isNumber, unFlattenObject } from '../../utilities/genericUtilities';

import { action } from 'mobx';

const FileInput = observer(function FileInput({metaKey, parameterKey, parameter}) {

	const { uiStore, domainStore } = useRootContext();
	const selectedEdits = uiStore.timelineControls.selectedTimelineItems;

	const inputId = `${metaKey}-${parameterKey}-input`;

	const onInputChange = action((event) => {
		const value = event.target.value;
		for (let edit of selectedEdits) {
			let functionToCall = null;
			if (metaKey === "custom") {
				functionToCall = edit.setCustomParameters;
			}
			if (metaKey === "spatial") {
				functionToCall = edit.setSpatialParameters;
			}
			if (metaKey === "temporal") {
				functionToCall = edit.setTemporalParameters;
			}
			functionToCall(unFlattenObject({
				[parameterKey]: value
			}));
		}
	});
	return (<div className="flex justify-between">
		<label className="text-left w-1/2" htmlFor={inputId}> {parameterKey} </label>
		<input className="w-1/2 border" id={inputId} type="file" value={parameter} onChange={(event) => onInputChange(event)} />
	</div>);
});

const TextInput = observer(function TextInput({metaKey, parameterKey, parameter}) {
	
	const { uiStore, domainStore } = useRootContext();
	const selectedEdits = uiStore.timelineControls.selectedTimelineItems;

	const inputId = `${metaKey}-${parameterKey}-input`;

	const onInputChange = action((event) => {
		const value = event.target.value;
		for (let edit of selectedEdits) {
			let functionToCall = null;
			if (metaKey === "custom") {
				functionToCall = edit.setCustomParameters;
			}
			if (metaKey === "spatial") {
				functionToCall = edit.setSpatialParameters;
			}
			if (metaKey === "temporal") {
				functionToCall = edit.setTemporalParameters;
			}
			functionToCall(unFlattenObject({
				[parameterKey]: value
			}));
		}
	});
	return (<div className="my-1 flex flex-col items-start">
		<label className="text-left w-1/2" htmlFor={inputId}> {parameterKey} </label>
		<input className="w-full border" id={inputId} type="text" value={parameter} onChange={(event) => onInputChange(event)} />
	</div>);
});

const NumberInput = observer(function NumberInput({metaKey, parameterKey, parameter, parameterMin, parameterMax}) {
	const {uiStore, domainStore} = useRootContext();
	const selectedEdits = uiStore.timelineControls.selectedTimelineItems;

	const inputId = `${metaKey}-${parameterKey}-input`;

	const onInputChange = action((event) => {
		const value = event.target.value;
		for (let edit of selectedEdits) {
			let functionToCall = null;
			if (metaKey === "custom") {
				functionToCall = edit.setCustomParameters;
			}
			if (metaKey === "spatial") {
				functionToCall = edit.setSpatialParameters;
			}
			if (metaKey === "temporal") {
				functionToCall = edit.setTemporalParameters;
			}
			functionToCall(unFlattenObject({
				[parameterKey]: value
			}));
		}
	});
	return (<div className="flex justify-between">
		<label className="text-left w-1/2" htmlFor={inputId}> {parameterKey} </label>
		<input 
			className="w-1/2 border"
			id={inputId}
			type="number"
			value={parameter}
			onChange={(event) => onInputChange(event)}
			min={parameterMin}
			max={parameterMax}
		/>
	</div>);
});

const DropDownInput = observer(function DropDownInput({metaKey, parameterKey, parameter, options}) {
	const {uiStore, domainStore} = useRootContext();
	const selectedEdits = uiStore.timelineControls.selectedTimelineItems;

	const inputId = `${metaKey}-${parameterKey}-input`;
	
	const onSelectChange = action((event) => {
		const value = event.target.value;
		for (let edit of selectedEdits) {
			let functionToCall = null;
			if (metaKey === "custom") {
				functionToCall = edit.setCustomParameters;
			}
			if (metaKey === "spatial") {
				functionToCall = edit.setSpatialParameters;
			}
			if (metaKey === "temporal") {
				functionToCall = edit.setTemporalParameters;
			}
			functionToCall(unFlattenObject({
				[parameterKey]: value
			}));
		}
	});

	return (<div className="my-1 flex justify-between">
		<label className="text-left w-1/2" htmlFor={inputId}> {parameterKey} </label>
		<select className="w-1/2 border" id={inputId} value={parameter} onChange={(event) => onSelectChange(event)}>
			{options.map((option) => {
				return (<option key={inputId + option} value={option}> {option} </option>);
			})}
		</select>	
	</div>);
});

const ColorInput = observer(function ColorInput({metaKey, parameterKey, parameter}) {
	const {uiStore, domainStore} = useRootContext();
	const selectedEdits = uiStore.timelineControls.selectedTimelineItems;

	const onInputChange = action((event) => {
		const value = event.target.value;
		const fillColor = value;
		console.log(fillColor)
		for (let edit of selectedEdits) {
			let functionToCall = null;
			if (metaKey === "custom") {
				functionToCall = edit.setCustomParameters;
			}
			if (metaKey === "spatial") {
				functionToCall = edit.setSpatialParameters;
			}
			if (metaKey === "temporal") {
				functionToCall = edit.setTemporalParameters;
			}
			functionToCall(unFlattenObject({
				[parameterKey]: fillColor
			}));
		}
	});

	return (<div className="my-1 flex justify-between">
		<label className="text-left w-1/2" htmlFor="colorInput"> {parameterKey} </label>
		<input className="w-1/2 border" id="colorInput" type="color" value={parameter} onChange={(event) => onInputChange(event)} />
	</div>);
});

const AlignInput = observer(function AlignInput({metaKey, parameterKey, parameter}) {
	
	const {uiStore, domainStore} = useRootContext();
	const selectedEdits = uiStore.timelineControls.selectedTimelineItems;

	const inputId = `${metaKey}-${parameterKey}-input`;

	const onInputChange = action((newAlign) => {
		for (let edit of selectedEdits) {
			let functionToCall = null;
			if (metaKey === "custom") {
				functionToCall = edit.setCustomParameters;
			}
			if (metaKey === "spatial") {
				functionToCall = edit.setSpatialParameters;
			}
			if (metaKey === "temporal") {
				functionToCall = edit.setTemporalParameters;
			}
			functionToCall(unFlattenObject({
				[parameterKey]: newAlign
			}));
		}
	});
	return (<div className="my-1 flex justify-start gap-1">
		<button 
			className="w-5 bg-gray-200 hover:bg-gray-300"
			onClick={() => onInputChange("left")}
		> L </button>
		<button 
			className="w-5 bg-gray-200 hover:bg-gray-300"
			onClick={() => onInputChange("center")}
		> C </button>
		<button 
			className="w-5 bg-gray-200 hover:bg-gray-300"
			onClick={() => onInputChange("right")}
		> R </button>
	</div>);
});

const ParameterControls = observer(function ParameterControls({
	metaKey, parameterKey, parameter
}) {
	const {uiStore, domainStore} = useRootContext();
	const inputOperationMapping = domainStore.inputOperationMapping;
	const dropdownOptions = domainStore.dropdownOptions;
	const numberParameterRanges = domainStore.numberParameterRanges;
	
	if (inputOperationMapping.text.includes(parameterKey)) {
		return (<TextInput metaKey={metaKey} parameterKey={parameterKey} parameter={parameter} />);
	}
	if (inputOperationMapping.number.includes(parameterKey)) {
		return (<NumberInput metaKey={metaKey} parameterKey={parameterKey} parameter={parameter}
			parameterMin={numberParameterRanges[parameterKey].min} parameterMax={numberParameterRanges[parameterKey].max}/>);
	}
	if (inputOperationMapping.dropdown.includes(parameterKey)) {
		return (<DropDownInput metaKey={metaKey} parameterKey={parameterKey} parameter={parameter}
			options={dropdownOptions[parameterKey]} />);
	}
	if (inputOperationMapping.color.includes(parameterKey)) {
		return (<ColorInput metaKey={metaKey} parameterKey={parameterKey} parameter={parameter} />);
	}
	if (inputOperationMapping.align.includes(parameterKey)) {
		return (<AlignInput metaKey={metaKey} parameterKey={parameterKey} parameter={parameter} />);
	}
	return (<div> no format for {metaKey}.{parameterKey} </div>);
});

export default ParameterControls;