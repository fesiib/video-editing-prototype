import React from "react";
import { observer } from "mobx-react-lite";
import { action } from "mobx";

import useRootContext from "../../hooks/useRootContext";

const AnnotationInstructions = observer(function AnnotationInstructions() {
	const { userStore, uiStore, domainStore } = useRootContext();

	const onStartClick = action(() => {
		uiStore.annotationControls.step++;
	});

	return (<div className="flex flex-col gap-2 items-center">
		<h2
			className="text-xl font-bold text-center"
		> Introduction </h2>
		<p> Hello there! </p>
		<h2
			className="text-xl font-bold text-center"
		> Instructions: </h2>
		<p> Annotate the edits </p>
		<button
			onClick={onStartClick}
			className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
		> Start </button>
	</div>);
});

export default AnnotationInstructions;