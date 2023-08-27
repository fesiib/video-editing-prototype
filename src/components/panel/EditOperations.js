import React from "react";

import { observer } from "mobx-react-lite";

import useRootContext from "../../hooks/useRootContext";
import { action } from "mobx";

const EditOperations = observer(function EditOperations() {

	const { uiStore, domainStore } = useRootContext();

	const inactiveButtonClassName = "w-full h-10 m-2 bg-indigo-300 hover:bg-indigo-400";
	const suggestedButtonClassName = "w-full h-10 m-2 bg-green-200 hover:bg-indigo-300 border-2 border-green-600";
	const activeButtonClassName = "w-full h-10 m-2 bg-indigo-500";

	const selectedOperationKey = domainStore.curIntent.editOperationKey;
	const suggestedOperationKey = uiStore.systemSetting ? domainStore.curIntent.suggestedEditOperationKey : "";

	const handleButtonClick = action((operationKey) => {
		if (operationKey === selectedOperationKey) {
			domainStore.curIntent.setEditOperationKey("");
			return;
		}
		domainStore.curIntent.setEditOperationKey(operationKey);
	});

	return (<div className="flex flex-col items-center p-1 m-1 border">
		<h2> Edit Operations</h2>
		{Object.keys(domainStore.editOperations).map((operationKey) => {
			const operation = domainStore.editOperations[operationKey];
			let currentClassName = inactiveButtonClassName;
			if (selectedOperationKey === operationKey) {
				currentClassName = activeButtonClassName;
			} else if (suggestedOperationKey === operationKey) {
				currentClassName = suggestedButtonClassName;
			}
			return (<button 
				key={"title_" + operation.title}
				className={currentClassName}
				onClick={(event) => handleButtonClick(operationKey)}
			>
				{operation.title}
			</button>)
		})}
	</div>);
});

export default EditOperations;