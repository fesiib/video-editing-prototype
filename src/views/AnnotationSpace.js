import React from "react";
import { observer } from "mobx-react-lite";
import { action } from "mobx";

import useRootContext from "../hooks/useRootContext";

import AnnotationInstructions from "../components/annotation/AnnotationInstructions";
import AnnotationSummary from "../components/annotation/AnnotationSummary";
import AnnotationComplete from "../components/annotation/AnnotationComplete";

const AnnotationSingle = observer(function AnnotationSingle({ idx }) {
	const { userStore, uiStore, domainStore } = useRootContext();
	// TODO: Get from the actual list
	const annotationCnt = 8;
	const step = uiStore.annotationControls.step;

	return (<div className="flex flex-col gap-2">
		<h2
			className="text-xl font-bold text-center"
		> Annotation {step} </h2>
		<div> Request Slide </div>
		<div>
			<h2> Annotation Summary </h2>
			<div> Labeling (temporal, spatial, edit, edit-specific) </div>
			<div> Temporal Segments </div>
			<div> Spatial Position </div>
			<div> Edit </div>
			<div> Edit-specific </div>
			<div> Pev Annotation / Next Annotation </div>
		</div>
	</div>);
});

const AnnotationSpace = observer(function AnnotationSpace() {
	const { userStore, uiStore, domainStore } = useRootContext();
	// TODO: Get from the actual list
	const annotationCnt = 8;

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
