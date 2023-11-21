import React from "react";
import { observer } from "mobx-react-lite";
import { action } from "mobx";

import useRootContext from "../hooks/useRootContext";

import AnnotationInstructions from "../components/annotation/AnnotationInstructions";
import AnnotationSummary from "../components/annotation/AnnotationSummary";

const AnnotationSpace = observer(function AnnotationSpace() {
	const { userStore, uiStore, domainStore } = useRootContext();
	// TODO: Get from the actual list
	const annotationCnt = 8;

	const step = uiStore.annotationControls.step;
	if (step === 0) {
		return <AnnotationInstructions />;
	}
	if (step === annotationCnt + 1) {
		return <AnnotationSummary />
	}
	return (<div>
		<h1> Annotation Space </h1>
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

export default AnnotationSpace;
