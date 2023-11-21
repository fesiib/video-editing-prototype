import React from "react";
import { observer } from "mobx-react-lite";
import { action } from "mobx";

import useRootContext from "../../hooks/useRootContext";


const AnnotationSummary = observer(function AnnotationSummary() {
	const { userStore, uiStore, domainStore } = useRootContext();


	return (<div className="flex flex-col gap-2">
		<h2
			className="text-xl font-bold text-center"
		> Summary </h2>
		<div> Annotation Tab </div>
		<div> list of edits </div>
	</div>);
});

export default AnnotationSummary;