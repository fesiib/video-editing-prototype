import React from "react";
import { observer } from "mobx-react-lite";
import { action } from "mobx";

import useRootContext from "../../hooks/useRootContext";

const AnnotationInstructions = observer(function AnnotationInstructions() {
	return (<div>
		<h2> Introduction </h2>
		<p> Hello there! </p>
		<h2> Instructions: </h2>
		<p> Annotate the edits </p>
	</div>);
});

export default AnnotationInstructions;