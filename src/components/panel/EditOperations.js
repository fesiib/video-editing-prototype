import React from "react";

import { observer } from "mobx-react-lite";

import useRootContext from "../../hooks/useRootContext";
import { action } from "mobx";

const EditOperations = observer(function EditOperations() {

	const { uiStore, domainStore } = useRootContext();

	const inactiveButtonClassName = "w-full h-10 m-2 bg-indigo-300 hover:bg-indigo-400";
	const activeButtonClassName = "w-full h-10 m-2 bg-indigo-500";

	const selectedOperationIdx = domainStore.curIntent.editOperationIdx;

	const handleButtonClick = action((idx) => {
		if (idx === selectedOperationIdx) {
			domainStore.curIntent.setEditOperationIdx(-1);
			return;
		}
		domainStore.curIntent.setEditOperationIdx(idx);
	});

	return (<div className="flex flex-col items-center p-1 m-1 border">
		<h2> Edit Operations</h2>
		{domainStore.editOperations.map((operation, idx) => {
			return (<button 
				key={operation.title}
				className={(idx === selectedOperationIdx ?
					activeButtonClassName : inactiveButtonClassName)}
				onClick={(event) => handleButtonClick(idx)}
			>
				{operation.title}
			</button>)
		})}
	</div>);
});

export default EditOperations;