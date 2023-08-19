import React from "react";

import { observer } from "mobx-react-lite";

import useRootContext from "../../hooks/useRootContext";

const EditOperations = observer(function EditOperations() {

	const { uiStore } = useRootContext();

	const buttonClassName = "w-full h-10 m-2 bg-indigo-400 hover:bg-indigo-500";

	return (<div className="flex flex-col items-center p-1 m-1 border">
		<h2> Edit Operations</h2>
		{uiStore.editOperations.map((operation) => {
			return (<button 
				key={operation.title}
				className={buttonClassName}
			>
				{operation.title}
			</button>)
		})}
	</div>);
});

export default EditOperations;