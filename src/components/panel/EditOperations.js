import React from "react";

import { observer } from "mobx-react-lite";

import useRootContext from "../../hooks/useRootContext";
import { action } from "mobx";

const EditOperations = observer(function EditOperations() {

	const { userStore, uiStore, domainStore } = useRootContext();

	const inactiveButtonClassName = "w-full my-1 hover:brightness-50 border rounded";
	const suggestedButtonClassName = "w-full my-1 hover:brightness-50 border-2 bg-green-600";
	const activeButtonClassName = "w-full my-1 brightness-50";

	const selectedOperationKey = domainStore.curIntent.editOperationKey;
	const suggestedOperationKey = userStore.systemSetting ? domainStore.curIntent.suggestedEditOperationKey : "";
	const suggestedOperationKeys = userStore.systemSetting ? domainStore.curIntent.suggestedEditOperationKeys : [];
	const handleButtonClick = action((operationKey) => {
		if (operationKey === selectedOperationKey) {
			domainStore.curIntent.setEditOperationKey("");
			return;
		}
		domainStore.curIntent.setEditOperationKey(operationKey);
	});

	return (<div className="flex flex-col w-1/4">
		<h2> Edit Operations </h2>
		<div className="flex flex-row flex-wrap items-center p-1 border bg-gray-100">
			{Object.keys(domainStore.editOperations).map((operationKey) => {
				const operation = domainStore.editOperations[operationKey];
				let currentClassName = inactiveButtonClassName;
				if (selectedOperationKey === operationKey) {
					currentClassName = activeButtonClassName;
				} else if (suggestedOperationKeys.includes(operationKey)) {
					currentClassName = suggestedButtonClassName;
				} else if (suggestedOperationKey === operationKey) {
					currentClassName = suggestedButtonClassName;
				}
				return (<button 
					key={"title_" + operation.title}
					className={currentClassName}
					onClick={(event) => handleButtonClick(operationKey)}
					style={{
						backgroundColor: uiStore.editColorPalette[operationKey],
					}}
				>
					{operation.title}
				</button>)
			})}
		</div>
	</div>);
});

export default EditOperations;