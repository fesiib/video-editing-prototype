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

	const inactiveButtonClassName = "w-full text-white my-1 hover:bg-green-700 rounded bg-green-600 flex flex-row items-center justify-center gap-1 rounded";
	const suggestedButtonClassName = "w-full my-1 hover:bg-yellow-400 bg-yellow-300 flex flex-row items-center justify-center gap-1 relative rounded";
	const activeButtonClassName = "w-full text-white font-bold my-1 rounded bg-green-900 flex flex-row items-center justify-center gap-1 rounded";

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
		<div className="flex flex-row items-center p-1 gap-2 border bg-gray-100 max-h-20">
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
						borderColor: uiStore.editColorPalette[operationKey],
						borderWidth: "2px",
					}}
				>
					{/* {
						//notification
						suggestedOperationKeys.includes(operationKey) ? (
							<>
  								<span class="absolute -right-3 -top-3 rounded-full h-4 w-4 bg-yellow-300">
								  <span class="animate-ping absolute left-0 top-0 h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
								</span>
							</>) : null
					} */}
					{operationIcons[operationKey]}
					{operation.title}
				</button>)
			})}
		</div>
	</div>);
});

export default EditOperations;