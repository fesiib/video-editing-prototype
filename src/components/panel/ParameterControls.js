import React from 'react';

import { observer } from "mobx-react-lite";

import useRootContext from "../../hooks/useRootContext";

import { isNumeric, unFlattenObject } from '../../utilities/genericUtilities';

import { action } from 'mobx';

const FileInput = observer(function FileInput({metaKey, parameterKey, parameter}) {

	const { uiStore, domainStore } = useRootContext();
	const selectedEdits = uiStore.timelineControls.selectedTimelineItems;

	const inputId = `${metaKey}-${parameterKey}-input`;

	const onFileInputChange = action((event) => {
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

	const onUrlInputChange = action((event) => {
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

	return (<div className="">
		{/* <label className="text-left w-1/2" htmlFor={inputId}> {parameterKey} </label> */}
		<div id={inputId} className="border grid">
			<input className="" 
				id={inputId + "_url"} 
				type="url"
				value={parameter}
				onChange={(event) => onUrlInputChange(event)} 
			/>
			<input className=""
				id={inputId}
				type="file"
				onChange={(event) => onFileInputChange(event)}
				accept={"image/*"}
			/>
		</div>
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

const NumberInput = observer(function NumberInput({metaKey, parameterKey, parameter}) {
	const {uiStore, domainStore} = useRootContext();
	const selectedEdits = uiStore.timelineControls.selectedTimelineItems;
	const inputId = `${metaKey}-${parameterKey}-input`;
	const defaultStep = selectedEdits.length === 0 ? 1 
		: selectedEdits[0].numberParameterConfig[parameterKey].step;

	const defaultMin = selectedEdits.reduce((min, edit) => {
		const parameterCfg = edit.numberParameterConfig[parameterKey];
		if (min === null || parameterCfg.min > min) {
			return parameterCfg.min;
		}
		return min;
	}, null);

	const defaultMax = selectedEdits.reduce((max, edit) => {
		const parameterCfg = edit.numberParameterConfig[parameterKey];
		if (max === null || parameterCfg.max < max) {
			return parameterCfg.max;
		}
		return max;
	}, null);

	const onInputChange = action((event) => {
		let value = event.target.value;
		if (!isNumeric(value)) {
			return;
		}
		let number = parseFloat(value);
		if (number < defaultMin) {
			return;
		}
		if (number > defaultMax) {
			return;
		}
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
				[parameterKey]: number
			}));
		}
	});

	const onStepClick = action((step) => {
		let newValue = parameter + step;
		if (newValue < defaultMin) {
			newValue = defaultMin;
		}
		if (newValue > defaultMax) {
			newValue = defaultMax;
		}

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
				[parameterKey]: newValue,
			}));
		}
	});

	return ((defaultMin === null || defaultMax === null || defaultMin >= defaultMax) ? null :
	<div className="flex justify-between">
		<label className="text-left w-1/2" htmlFor={inputId}> {parameterKey} </label>
		<div className="flex justify-end">
			<input 
				className="w-1/2 border"
				id={inputId}
				type="text"
				value={parameter}
				onClick={(event) => {event.target.select()}}
				onChange={(event) => onInputChange(event)}
			/>
			<button 
				className={"w-5 bg-gray-200 hover:bg-gray-300"}
				onClick={() => onStepClick(defaultStep)}
			> + </button>
			<button 
				className={"w-5 bg-gray-200 hover:bg-gray-300"}
				onClick={() => onStepClick(-defaultStep)}
			> - </button>
		</div>
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
		<input className="w-1/4 border" id="colorInput" type="color" value={parameter} onChange={(event) => onInputChange(event)} />
	</div>);
});

const RangeInput = observer(function ColorInput({metaKey, parameterKey, parameter}) {
	const {uiStore, domainStore} = useRootContext();
	const selectedEdits = uiStore.timelineControls.selectedTimelineItems;

	const defaultStep = selectedEdits.length === 0 ? 1 
		: selectedEdits[0].numberParameterConfig[parameterKey].step;

	const defaultMin = selectedEdits.reduce((min, edit) => {
		const parameterCfg = edit.numberParameterConfig[parameterKey];
		if (min === null || parameterCfg.min > min) {
			return parameterCfg.min;
		}
		return min;
	}, null);

	const defaultMax = selectedEdits.reduce((max, edit) => {
		const parameterCfg = edit.numberParameterConfig[parameterKey];
		if (max === null || parameterCfg.max < max) {
			return parameterCfg.max;
		}
		return max;
	}, null);

	const onInputChange = action((event) => {
		const value = event.target.value;
		const number = parseFloat(value);
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
				[parameterKey]: number
			}));
		}
	});

	return (defaultMin === null || defaultMax === null || defaultMin > defaultMax) ? null : (
	<div className="my-1 flex justify-between">
		<label className="text-left w-1/2" htmlFor="opacityInput"> {parameterKey} </label>
		<input className="w-1/2 border" id="opacityInput" type="range" min={defaultMin} max={defaultMax} step={defaultStep} value={parameter} onChange={(event) => onInputChange(event)}/>
	</div>);
});


const AlignInput = observer(function AlignInput({metaKey, parameterKey, parameter, options}) {
	
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
	return (<div id={inputId} className="my-1 flex justify-start gap-1">
		{
			options.map((option) => {
				return (<button 
					key={`${inputId}_${option}`}
					className={"w-5 bg-gray-200 hover:bg-gray-300" + (parameter === option ? " bg-gray-300" : "")}
					onClick={() => onInputChange(option)}
				> {option.toUpperCase()[0]} </button>);
			})
		}
	</div>);
});

const ToggleInput = observer(function ToggleInput({metaKey, parameterKey, parameter}) {
	const {uiStore, domainStore} = useRootContext();
	const selectedEdits = uiStore.timelineControls.selectedTimelineItems;

	const inputId = `${metaKey}-${parameterKey}-input`;

	const onInputChange = action((event) => {
		const value = event.target.value;
		console.log(value);
		const number = parseInt(value);
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
				[parameterKey]: number
			}));
		}
	});

	return (<div className="my-1 flex justify-between">
		<label className="text-left w-1/2" htmlFor={inputId}> {parameterKey} </label>
		<input className="w-1/2 border" id={inputId} type="checkbox" value={parameter} onChange={(event) => onInputChange(event)} />
	</div>);
});

const ParameterControls = observer(function ParameterControls({
	metaKey, parameterKey, parameter
}) {
	const {uiStore, domainStore} = useRootContext();
	const inputOperationMapping = domainStore.inputOperationMapping;
	const dropdownOptions = domainStore.dropdownOptions;

	if (inputOperationMapping.text.includes(parameterKey)) {
		return (<TextInput metaKey={metaKey} parameterKey={parameterKey} parameter={parameter} />);
	}
	if (inputOperationMapping.number.includes(parameterKey)) {
		return (<NumberInput metaKey={metaKey} parameterKey={parameterKey} parameter={parameter} />);
	}
	if (inputOperationMapping.dropdown.includes(parameterKey)) {
		return (<DropDownInput metaKey={metaKey} parameterKey={parameterKey} parameter={parameter}
			options={dropdownOptions[parameterKey]} />);
	}
	if (inputOperationMapping.color.includes(parameterKey)) {
		return (<ColorInput metaKey={metaKey} parameterKey={parameterKey} parameter={parameter} />);
	}
	if (inputOperationMapping.range.includes(parameterKey)) {
		return (<RangeInput metaKey={metaKey} parameterKey={parameterKey} parameter={parameter} />);
	}
	if (inputOperationMapping.align.includes(parameterKey)) {
		return (<AlignInput metaKey={metaKey} parameterKey={parameterKey} parameter={parameter} 
			options={dropdownOptions[parameterKey]} />);
	}
	if (inputOperationMapping.file.includes(parameterKey)) {
		return (<FileInput metaKey={metaKey} parameterKey={parameterKey} parameter={parameter} />);
	}
	if (inputOperationMapping.toggle.includes(parameterKey)) {
		return (<ToggleInput metaKey={metaKey} parameterKey={parameterKey} parameter={parameter} />);
	}
	return (<div> no format for {metaKey}.{parameterKey} </div>);
});

export default ParameterControls;