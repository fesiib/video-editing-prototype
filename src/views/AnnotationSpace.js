import React from "react";
import { observer } from "mobx-react-lite";
import { action } from "mobx";

import useRootContext from "../hooks/useRootContext";

import { annotationImageUrl } from "../services/pipeline";

import AnnotationInstructions from "../components/annotation/AnnotationInstructions";
import AnnotationSummary from "../components/annotation/AnnotationSummary";
import AnnotationComplete from "../components/annotation/AnnotationComplete";
import Highlightable from "highlightable";

const LABELS = {
	temporal: "Temporal",
	spatial: "Spatial",
	edit: "Edit",
};

const AnnotationImage = observer(function AnnotationImage() {
	const { userStore, uiStore, domainStore } = useRootContext();
	const annotationTask = userStore.annotationTask;
	const step = uiStore.annotationControls.step;
	const participantId = annotationTask[step - 1].participantId;
	const intentId = annotationTask[step - 1].intentId;
	const imageUrl = annotationImageUrl(participantId, intentId);

	return (<div className="flex flex-col gap-2">
		<div className="flex flex-row justify-center">
			<img
				src={imageUrl}
				className="object-contain"
			/>
		</div>
	</div>);
});

const LabelText = observer(function LabelText() {
	const { userStore, uiStore, domainStore } = useRootContext();
	const annotationTask = userStore.annotationTask;
	const annotationCnt = annotationTask.length;
	const step = uiStore.annotationControls.step;
	const description = annotationTask[step - 1].description;

	const [labeling, setLabeling] = React.useState("");
	const [temporalRanges, setTemporalRanges] = React.useState([]);
	const [spatialRanges, setSpatialRanges] = React.useState([]);
	const [editRanges, setEditRanges] = React.useState([]);

	const onResetClick = action(() => {
		setLabeling("");
		setTemporalRanges([]);
		setSpatialRanges([]);
		setEditRanges([]);
	});

	const onTemporalClick = action(() => {
		if (labeling === LABELS.temporal) {
			setLabeling("");
		}
		else {
			setLabeling(LABELS.temporal);
		}
	});
	const onSpatialClick = action(() => {
		if (labeling === LABELS.spatial) {
			setLabeling("");
		}
		else {
			setLabeling(LABELS.spatial);
		}
	});
	const onEditClick = action(() => {
		if (labeling === LABELS.edit) {
			setLabeling("");
		}
		else {
			setLabeling(LABELS.edit);
		}
	});

	const onTextSelect = action((event) => {
		const start = event.start;
		const end = event.end;
		if (labeling === LABELS.temporal) {
			setTemporalRanges([...temporalRanges, { start, end }]);
		}
		else if (labeling === LABELS.spatial) {
			setSpatialRanges([...spatialRanges, { start, end }]);
		}
		else if (labeling === LABELS.edit) {
			setEditRanges([...editRanges, { start, end }]);
		}
	});
	const getHighlightStyle = action((range, charIndex) => {
		for (const { start, end } of temporalRanges) {
			if (charIndex >= start && charIndex < end) {
				return {
					backgroundColor: "yellow",
				};
			}
		}
		for (const { start, end } of spatialRanges) {
			if (charIndex >= start && charIndex < end) {
				return {
					backgroundColor: "green",
				};
			}
		}
		for (const { start, end } of editRanges) {
			if (charIndex >= start && charIndex < end) {
				return {
					backgroundColor: "red",
				};
			}
		}

		return {};
	});

	return (<div
		className="border border-gray-400 rounded-lg px-4 py-2"
	>
		<div className="flex flex-row justify-between">
			<div className="flex flex-row gap-2">
				<h3
					className="text-l font-bold text-center"
				> Labels: </h3>
				<button
					className={
						"text-white bg-yellow-500 hover:bg-yellow-600 font-bold py-1 px-1 rounded w-28"
						+ (labeling === LABELS.temporal ? " outline outline-offset-1 outline-2 outline-black" : "")
					}
					onClick={onTemporalClick}
				>
					{LABELS.temporal}
				</button>
				<button
					className={
						"text-white bg-green-500 hover:bg-green-600 font-bold py-1 px-1 rounded w-28"
						+ (labeling === LABELS.spatial ? " outline outline-offset-1 outline-2 outline-black" : "")
					}
					onClick={onSpatialClick}
				>
					{LABELS.spatial}
				</button>
				<button
					className={
						"text-white bg-red-500 hover:bg-red-600 font-bold py-1 px-1 rounded w-28"
						+ (labeling === LABELS.edit ? " outline outline-offset-1 outline-2 outline-black" : "")
					}
					onClick={onEditClick}
				>
					{LABELS.edit}
				</button>
			</div>
			<button
				className={
					"text-white bg-gray-500 hover:bg-gray-600 font-bold py-1 px-1 rounded w-16"
				}
				onClick={onResetClick}
			>
				Reset
			</button>
		</div>
		<div className={"my-2 " + (labeling === "" ? "invisible" : "visible")}>
			Please select the parts from below for <span className="font-bold"> {labeling} </span>
		</div>
		<div
			className="bg-white text-l text-left my-2 px-2 py-2"
		>
			<Highlightable
				text={description}
				ranges={[...temporalRanges, ...spatialRanges, ...editRanges]}
				onTextHighlighted={onTextSelect}
				enabled={labeling !== ""}
				highlightStyle={getHighlightStyle}
			/>
		</div>
	</div>);
});

const TemporalSummary = observer(function TemporalSummary() {
	const { userStore, uiStore, domainStore } = useRootContext();
	return (<div
		className="border border-gray-400 rounded-lg px-4 py-2"
	>
		Temporal segments
	</div>);
});

const SpatialSummary = observer(function SpatialSummary() {
	const { userStore, uiStore, domainStore } = useRootContext();
	return (<div
		className="border border-gray-400 rounded-lg px-4 py-2"
	>
		Spatial regions
	</div>);
});

const EditSummary = observer(function EditSummary() {
	const { userStore, uiStore, domainStore } = useRootContext();
	return (<div
		className="border border-gray-400 rounded-lg px-4 py-2"
	>
		Edit Type & Parameters
	</div>);
});

const AnnotationSingle = observer(function AnnotationSingle({ idx }) {
	const { userStore, uiStore, domainStore } = useRootContext();
	const annotationTask = userStore.annotationTask;
	const annotationCnt = annotationTask.length;
	const step = uiStore.annotationControls.step;

	const description = annotationTask[step - 1].description;

	return (<div className="flex flex-col gap-2">
		<h2
			className="text-xl font-bold text-center"
		> Annotation {step} </h2>
		<AnnotationImage />
		<div>
			<h2
				className="text-xl font-bold text-center"
			> Annotation Summary </h2>
			<LabelText/>
			<TemporalSummary />
			<SpatialSummary />
			<EditSummary />
		</div>
	</div>);
});

const AnnotationSpace = observer(function AnnotationSpace() {
	const { userStore, uiStore, domainStore } = useRootContext();
	// TODO: Get from the actual list
	const annotationTask = userStore.annotationTask;
	const annotationCnt = annotationTask.length;
	const step = uiStore.annotationControls.step;

	const onPrevClick = action(() => {
		uiStore.annotationControls.step--;
	});
	const onNextClick = action(() => {
		uiStore.annotationControls.step++;
	});

	return (<div className="flex flex-col gap-2">
		<h1
			className="text-2xl font-bold text-center"
		> Annotation Space </h1>
		{
			step === 0 && <AnnotationInstructions />
		}
		{
			(step > 0 && step <= annotationCnt) && <AnnotationSingle />
		}
		{
			step === annotationCnt + 1 && <AnnotationSummary />
		}
		{
			step > annotationCnt + 1 && <AnnotationComplete />
		}
		<div className="flex flex-row justify-around">
			{
				step > 0 && step <= annotationCnt + 1 ? (<>

					<button 
						onClick={onPrevClick}
						className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
					> {step === 1 ? `<- Instructions` : `<- Prev.`} </button>
					<button 
						onClick={onNextClick}
						className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
					> {(step === annotationCnt && `Review Annotations`) ||  (step < annotationCnt && `Next ->`) || (step === annotationCnt + 1 && `Complete`)} </button>
				</>) : (null)
			}
		</div>
	</div>);
});

export default AnnotationSpace;
