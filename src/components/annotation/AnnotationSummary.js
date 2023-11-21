import React from "react";
import { observer } from "mobx-react-lite";
import { action } from "mobx";

import useRootContext from "../../hooks/useRootContext";

const AnnotationSummary = observer(function AnnotationSummary() {
	return (<div>
		<h2> Summary </h2>
		<div> Annotation Tab </div>
		<div> list of edits </div>
		<button> Complete </button>
	</div>);
});

export default AnnotationSummary;