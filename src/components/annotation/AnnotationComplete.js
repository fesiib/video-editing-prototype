import React from "react";
import { observer } from "mobx-react-lite";
import { action } from "mobx";

import useRootContext from "../../hooks/useRootContext";

const AnnotationComplete = observer(function AnnotationComplete() {
	const { userStore, uiStore, domainStore } = useRootContext();

	const onSaveClick = action(() => {
		uiStore.annotationControls.step = 0;
		// TODO: save the annotation
		// TODO: Go to homepage
	});

	return (<div className="flex flex-col gap-2 items-center">
		<h2
			className="text-xl font-bold text-center"
		> Thank You for Completing the Task! </h2>
		<div>
			<button
				onClick={onSaveClick}
				className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
			> Save & Go to Homepage </button>
		</div>
	</div>);
});

export default AnnotationComplete;