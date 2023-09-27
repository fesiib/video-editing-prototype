import React, { useEffect, useRef, useState } from 'react';

import { Link } from 'react-router-dom';

import { observer } from "mobx-react-lite";

import useRootContext from "../../hooks/useRootContext";

import { isNumeric, unFlattenObject } from '../../utilities/genericUtilities';

import { action } from 'mobx';
import { secondsToFormat, zeroPad } from '../../utilities/timelineUtilities';
import InputNumber from 'rc-input-number';

const FileInput = observer(function FileInput({metaKey, parameterKey, parameter}) {

	const { uiStore, domainStore } = useRootContext();
	const selectedEdits = uiStore.timelineControls.selectedTimelineItems;

	const operationName = domainStore.operationNameMapping[parameterKey];

	const inputId = `${metaKey}-${parameterKey}-input`;

	const onFileInputChange = action((event) => {
		const value = event.target.value;
		for (let edit of selectedEdits) {
			if (edit.isSuggested) {
				continue;
			}
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
			if (edit.isSuggested) {
				continue;
			}
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

	return (<div className="flex flex-col">
		<label className="text-left text-sm w-1/2" htmlFor={inputId}> {operationName} </label> 
		<div id={inputId+"_container"} className="border grid text-sm">
			<input className="" 
				id={inputId + "_url"} 
				type="url"
				value={parameter === "mixed" ? "" : parameter}
				placeholder={parameter === "mixed" ? "mixed" : ""}
				onChange={(event) => onUrlInputChange(event)} 
				autoComplete='off'
			/>
			{/* <input className=""
				id={inputId}
				type="file"
				onChange={(event) => onFileInputChange(event)}
				accept={"image/*"}
				autoComplete='off'
			/> */}
		</div>
	</div>);
});

const TextInput = observer(function TextInput({metaKey, parameterKey, parameter}) {
	
	const { uiStore, domainStore } = useRootContext();
	const operationName = domainStore.operationNameMapping[parameterKey];

	const selectedEdits = uiStore.timelineControls.selectedTimelineItems;

	const inputId = `${metaKey}-${parameterKey}-input`;
	const onInputChange = action((event) => {
		const value = event.target.value;
		for (let edit of selectedEdits) {
			if (edit.isSuggested) {
				continue;
			}
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
	return (<div className="flex flex-col items-start">
		<label className="text-left text-xs w-1/2" htmlFor={inputId}> {operationName} </label>
		<input 
			className="h-6 w-full border "
			id={inputId}
			type="text"
			value={parameter === "mixed" ? "" : parameter}
			placeholder={parameter === "mixed" ? "mixed" : "text"}
			onChange={(event) => onInputChange(event)} 
			autoComplete='off'
		/>
	</div>);
});

const NumberInput = observer(function NumberInput({metaKey, parameterKey, parameter}) {
	const {uiStore, domainStore} = useRootContext();
	const selectedEdits = uiStore.timelineControls.selectedTimelineItems;

	const operationName = domainStore.operationNameMapping[parameterKey];

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
		// if (number < defaultMin) {
		// 	return;
		// }
		// if (number > defaultMax) {
		// 	return;
		// }
		for (let edit of selectedEdits) {
			if (edit.isSuggested) {
				continue;
			}
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
		let newValue = step;
		if (!isNumeric(parameter.toString())) {
			newValue += defaultMin;
		}
		else {
			newValue += parseFloat(parameter);
		}
		if (newValue < defaultMin) {
			newValue = defaultMin;
		}
		if (newValue > defaultMax) {
			newValue = defaultMax;
		}

		for (let edit of selectedEdits) {
			if (edit.isSuggested) {
				continue;
			}
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
		<label className="text-left text-sm" htmlFor={inputId}> {operationName} </label>
		<div className="flex justify-end w-1/2 text-sm">
			<input 
				className="w-1/2 border"
				id={inputId}
				type="text"
				value={parameter === "mixed" ? "" : parameter}
				placeholder={parameter === "mixed" ? "mixed" : "number"}
				onClick={(event) => {event.target.select()}}
				onChange={(event) => onInputChange(event)}
				autoComplete='off'
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

const TimeInput = observer(function TimeInput({metaKey, parameterKey, parameter}) {
	const {uiStore, domainStore} = useRootContext();
	const selectedEdits = uiStore.timelineControls.selectedTimelineItems;

	const operationName = domainStore.operationNameMapping[parameterKey];

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

	const formattedTime = secondsToFormat(parseFloat(parameter));
	const formattedMin = secondsToFormat(defaultMin);
	const formattedMax = secondsToFormat(defaultMax);
	const refs = {
		hh: useRef(),
		mm: useRef(),
		ss: useRef(),
		ms: useRef(),
	};
	
	const onInputChange = action((changedNumber, key) => {
		console.log(changedNumber);
		if (changedNumber === null) {
			return;
		}

		const hhRef = refs.hh;
		const mmRef = refs.mm;
		const ssRef = refs.ss;
		const msRef = refs.ms;

		let hhValue = (hhRef.current == null || hhRef.current == undefined) ? "" : hhRef.current.value;
		let mmValue = (mmRef.current == null || mmRef.current == undefined) ? "" : mmRef.current.value;
		let ssValue = (ssRef.current == null || ssRef.current == undefined) ? "" : ssRef.current.value;
		let msValue = (msRef.current == null || msRef.current == undefined) ? "" : msRef.current.value;

		hhValue = hhValue === "" ? "0" : hhValue;
		mmValue = mmValue === "" ? "0" : mmValue;
		ssValue = ssValue === "" ? "0" : ssValue;
		msValue = msValue === "" ? "0" : msValue;

		if (!isNumeric(hhValue) || !isNumeric(mmValue) || !isNumeric(ssValue) || !isNumeric(msValue)) {
			return;
		}
		hhValue = parseFloat(hhValue);
		mmValue = parseFloat(mmValue);
		ssValue = parseFloat(ssValue);
		msValue = parseFloat(msValue);

		if (key === "hh") {
			hhValue = changedNumber;
		}
		if (key === "mm") {
			mmValue = changedNumber;
		}
		if (key === "ss") {
			ssValue = changedNumber;
		}
		if (key === "ms") {
			msValue = changedNumber;
		}

		let number = hhValue * 3600 + mmValue * 60 + ssValue + msValue / 100;
		if (number < defaultMin) {
			return;
		}
		if (number > defaultMax) {
			return;
		}
		for (let edit of selectedEdits) {
			if (edit.isSuggested) {
				continue;
			}
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
		let newValue = step;
		if (!isNumeric(parameter.toString())) {
			newValue += defaultMin;
		}
		else {
			newValue += parseFloat(parameter);
		}
		if (newValue < defaultMin) {
			newValue = defaultMin;
		}
		if (newValue > defaultMax) {
			newValue = defaultMax;
		}

		for (let edit of selectedEdits) {
			if (edit.isSuggested) {
				continue;
			}
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
		<label className="text-left text-sm w-1/3 truncate" htmlFor={inputId}> {operationName} </label>
		<div className="flex justify-end text-sm w-2/3"
			id={inputId}
		>
			<div className='flex flex-row'>
			{
				Object.keys(formattedTime).map((key) => {
					const curRef = refs[key];
					const curValue = formattedTime[key];
					if (key === "hh" && curValue === 0) {
						return null;
					}
					return (
					<div
						className="w-2/3 flex flex-col justify-center items-start overflow-hidden"
						key={inputId + "-" + key}
					>
						<InputNumber
							className='w-10 mr-1 overflow-hidden'
							maxLength={(key === "hh" || key === "mm") ? 2 : 4}
							ref={curRef}
							value={curValue}
							onChange={(number) => onInputChange(number, key)}
							min={0}
							max={(key === "hh" || key === "ms") ? 99 : 59.9}
							precision={(key === "hh" || key === "ms" || key == "mm") ? 0 : 1}
							placeholder={key}
							onClick={(event) => {event.target.select()}}
							controls={false}
						/>
						{/* <input 
							className="w-full border"
							ref={curRef}
							type="text"
							value={zeroPad(curValue, 2)}
							placeholder={key}
							onClick={(event) => {event.target.select()}}
							onChange={(event) => onInputChange(event)}
							autoComplete='off'
						/> */}
						<label className="text-xs"
							htmlFor={inputId + "-" + key}
						> {key} </label>
					</div>);
				})
			}
			</div>
			<button 
				className={"w-5 h-fit bg-gray-200 hover:bg-gray-300"}
				onClick={() => onStepClick(defaultStep)}
			> + </button>
			<button 
				className={"w-5 h-fit bg-gray-200 hover:bg-gray-300"}
				onClick={() => onStepClick(-defaultStep)}
			> - </button>
		</div>
	</div>);
});

const DropDownInput = observer(function DropDownInput({metaKey, parameterKey, parameter, options}) {
	const {uiStore, domainStore} = useRootContext();
	const selectedEdits = uiStore.timelineControls.selectedTimelineItems;

	const operationName = domainStore.operationNameMapping[parameterKey];

	const inputId = `${metaKey}-${parameterKey}-input`;
	
	const onSelectChange = action((event) => {
		const value = event.target.value;
		for (let edit of selectedEdits) {
			if (edit.isSuggested) {
				continue;
			}
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
		<label className="text-left text-sm w-1/2" htmlFor={inputId}> {operationName} </label>
		<select 
			className="w-1/2 border text-sm"
			id={inputId}
			value={parameter === "mixed" ? null : parameter}
			placeholder={parameter === "mixed" ? "mixed" : parameterKey}
			onChange={(event) => onSelectChange(event)}
		>
			{options.map((option) => {
				return (<option key={inputId + option} value={option}> {option} </option>);
			})}
		</select>	
	</div>);
});

const ColorInput = observer(function ColorInput({metaKey, parameterKey, parameter}) {
	const {uiStore, domainStore} = useRootContext();
	const selectedEdits = uiStore.timelineControls.selectedTimelineItems;
	const operationName = domainStore.operationNameMapping[parameterKey];

	const inputId = `${metaKey}-${parameterKey}-input`;

	const onInputChange = action((event) => {
		const value = event.target.value;
		const fillColor = value;
		for (let edit of selectedEdits) {
			if (edit.isSuggested) {
				continue;
			}
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
		<label className="text-left text-sm w-1/2" htmlFor={inputId}> {operationName} </label>
		<input 
			className="w-1/4 border text-sm"
			id={inputId}
			type="color"
			value={parameter === "mixed" ? "#000000" : parameter}
			onChange={(event) => onInputChange(event)} 
			autoComplete='off'
		/>
	</div>);
});

const RangeInput = observer(function ColorInput({metaKey, parameterKey, parameter}) {
	const {uiStore, domainStore} = useRootContext();
	const selectedEdits = uiStore.timelineControls.selectedTimelineItems;
	const operationName = domainStore.operationNameMapping[parameterKey];

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
		const value = event.target.value;
		const number = parseFloat(value);
		for (let edit of selectedEdits) {
			if (edit.isSuggested) {
				continue;
			}
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
	<div className="flex justify-between">
		<label className="text-left text-sm w-1/2" htmlFor={inputId}> {operationName} </label>
		<input 
			className="w-1/2 border"
			id={inputId}
			type="range"
			min={defaultMin}
			max={defaultMax}
			step={defaultStep}
			value={parameter}
			onChange={(event) => onInputChange(event)}/>
	</div>);
});


const AlignInput = observer(function AlignInput({metaKey, parameterKey, parameter, options}) {
	
	const {uiStore, domainStore} = useRootContext();
	const selectedEdits = uiStore.timelineControls.selectedTimelineItems;
	const operationName = domainStore.operationNameMapping[parameterKey];

	const inputId = `${metaKey}-${parameterKey}-input`;

	const onInputChange = action((newAlign) => {
		for (let edit of selectedEdits) {
			if (edit.isSuggested) {
				continue;
			}
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
	return (<div id={inputId} className="mt-1 flex justify-start gap-1">
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
	const operationName = domainStore.operationNameMapping[parameterKey];

	const inputId = `${metaKey}-${parameterKey}-input`;

	const onInputChange = action((event) => {
		const value = event.target.value;
		const number = parseInt(value);
		for (let edit of selectedEdits) {
			if (edit.isSuggested) {
				continue;
			}
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
		<label className="text-left text-sm w-1/2" htmlFor={inputId}> {operationName} </label>
		<input
			className="w-1/2 border"
			id={inputId}
			type="checkbox"
			value={parameter}
			onChange={(event) => onInputChange(event)}
		/>
	</div>);
});

const SearchInput = observer(function SearchInput({metaKey, parameterKey, parameter}) {
	const {uiStore, domainStore} = useRootContext();
	const selectedEdits = uiStore.timelineControls.selectedTimelineItems;
	const operationName = domainStore.operationNameMapping[parameterKey];

	const isDisabled = parameter === "mixed" || parameter === "" || selectedEdits.some((edit) => edit.isSuggested);

	const inputId = `${metaKey}-${parameterKey}-input`;

	const onInputChange = action((event) => {
		const value = event.target.value;
		for (let edit of selectedEdits) {
			if (edit.isSuggested) {
				continue;
			}
			edit.setCustomParameters(unFlattenObject({
				[parameterKey]: value
			}));
		}
	});
	// <div className="flex flex-col">
	// 	<label className="text-left text-sm w-1/2" htmlFor={inputId}> {operationName} </label> 
	// 	<div id={inputId} className="border grid text-sm">
	// 		<input className="" 
	// 			id={inputId + "_url"} 
	// 			type="url"
	// 			value={parameter === "mixed" ? "" : parameter}
	// 			placeholder={parameter === "mixed" ? "mixed" : ""}
	// 			onChange={(event) => onUrlInputChange(event)} 
	// 		/>
	// 		<input className=""
	// 			id={inputId}
	// 			type="file"
	// 			onChange={(event) => onFileInputChange(event)}
	// 			accept={"image/*"}
	// 		/>
	// 	</div>
	// </div>

	return (<div className="flex flex-col">
		<label className="text-left text-sm w-1/2" htmlFor={inputId}> {operationName} </label>
		<div className='flex flex-row w-full justify-between'>
			<input 
				className="w-2/3 border px-1 text-sm"
				id={inputId}
				type="search"
				value={parameter}
				onChange={(event) => onInputChange(event)}
				autoComplete='off'
			/>
			<button className='text-sm border w-fit px-1 bg-indigo-200 rounded hover:bg-indigo-300 disabled:opacity-50 disabled:hover:bg-indigo-200'
				disabled={isDisabled}
			>
				<Link
					to={`https://www.google.com/search?tbm=isch&q=${parameter}`}
					target="_blank"
					rel="noopener noreferrer"
					
				>
					Search
				</Link>
			</button>
		</div>
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
	if (inputOperationMapping.time.includes(parameterKey)) {
		return (<TimeInput metaKey={metaKey} parameterKey={parameterKey} parameter={parameter} />);
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
	if (inputOperationMapping.search.includes(parameterKey)) {
		return (<SearchInput metaKey={metaKey} parameterKey={parameterKey} parameter={parameter} />);
	}
	return (<div> no format for {metaKey}.{parameterKey} </div>);
});

export default ParameterControls;