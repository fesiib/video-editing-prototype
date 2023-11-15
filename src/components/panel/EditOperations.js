import React from "react";

import { observer } from "mobx-react-lite";

import { AiOutlineBulb } from "react-icons/ai";
import { MdFormatColorText } from "react-icons/md";
import { BiImageAlt } from "react-icons/bi";
import { CgShapeSquare } from "react-icons/cg";
import { RiScissors2Fill } from "react-icons/ri";
import { BiSolidCrop } from "react-icons/bi";
import { TbZoomPan } from "react-icons/tb";
import { MdLensBlur } from "react-icons/md";

import useRootContext from "../../hooks/useRootContext";
import { action } from "mobx";

const EditOperations = observer(function EditOperations() {

	const { userStore, uiStore, domainStore } = useRootContext();

	const inactiveButtonClassName = "w-full text-white my-1 hover:bg-green-700 rounded bg-green-600 flex flex-row items-center justify-center gap-1 rounded opacity-50";
	const suggestedButtonClassName = "w-full my-1 hover:bg-yellow-400 bg-yellow-300 flex flex-row items-center justify-center gap-1 relative rounded opacity-50";
	const activeButtonClassName = "w-full text-white font-bold my-1 rounded bg-green-700 flex flex-row items-center justify-center gap-1 rounded";

	const inactiveRadioClassName = "w-4 h-4 hover:cursor-pointer";
	const suggestedRadioClassName = "w-4 h-4 hover:cursor-pointer";
	const activeRadioClassName = "w-4 h-4 hover:cursor-pointer";
	
	const curTab = domainStore.curTab;

	const selectedOperationKey = curTab.editOperationKey;
	const suggestedOperationKeys = userStore.systemSetting ? curTab.suggestedEditOperationKeys : [];
	const handleButtonClick = action((operationKey) => {
		if (operationKey === selectedOperationKey) {
			curTab.setEditOperationKey("");
			uiStore.logData("operationSelect", {
				editOperation: null,
			});
			return;
		}
		curTab.setEditOperationKey(operationKey);
		uiStore.logData("operationSelect", {
			editOperation: operationKey,
		});
	});

	const operationIcons = {
		"text": <MdFormatColorText />,
		"image": <BiImageAlt />,
		"shape": <CgShapeSquare />,
		"cut": <RiScissors2Fill />,
		"crop": <BiSolidCrop />,
		"zoom": <TbZoomPan />,
		"blur": <MdLensBlur />,
	};

	return (<div 
		// className="flex flex-col w-1/4"
		className="flex flex-col text-black"
	>
		{/* <h2> Edit Operations </h2> */}
		<fieldset >
			<legend className=""> Select an edit operation: </legend>
			<div className="flex flex-row items-center p-1 gap-2 border bg-gray-100 max-h-20">
				{Object.keys(domainStore.editOperations).map((operationKey) => {
					const operation = domainStore.editOperations[operationKey];
					let currentClassName = inactiveButtonClassName;
					if (selectedOperationKey === operationKey) {
						currentClassName = activeButtonClassName;
					} else if (suggestedOperationKeys.includes(operationKey)) {
						currentClassName = suggestedButtonClassName;
					}

					let currentRadioClassName = inactiveRadioClassName;
					if (selectedOperationKey === operationKey) {
						currentRadioClassName = activeRadioClassName;
					} else if (suggestedOperationKeys.includes(operationKey)) {
						currentRadioClassName = suggestedRadioClassName;
					}
					return (<div
						key={"title_" + operation.title}
						className="flex flex-col w-full justify-center items-center"
					>
						<input 
							type="radio"
							name="edit_operation"
							id={`edit-op-${operationKey}`}
							value={operationKey}
							checked={selectedOperationKey === operationKey}
							onChange={(event) => handleButtonClick(operationKey)}
							className={currentRadioClassName}
						/>
						<button 
							className={currentClassName}
							onClick={(event) => handleButtonClick(operationKey)}
							style={{
								borderColor: uiStore.editColorPalette[operationKey],
								borderWidth: "2px",
							}}
						>
							{operationIcons[operationKey]}
							{operation.title}
						</button>
					</div>)
				})}
			</div>
		</fieldset>
	</div>);
});

export default EditOperations;