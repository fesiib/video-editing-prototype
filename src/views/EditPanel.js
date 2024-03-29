import React from "react";

import { observer } from "mobx-react-lite";

import EditOperations from "../components/panel/EditOperations";
import OperationPanel from "../components/panel/OperationPanel";
import useRootContext from "../hooks/useRootContext";

const EditPanel = observer(function EditPanel() {
	const { domainStore } = useRootContext();

	const curTab = domainStore.curTab;

	const selectedOperationKey = curTab.editOperation;

	return (<div className="flex flex-col w-full">
		<EditOperations />
		{
			selectedOperationKey === null ? null : (
				<OperationPanel />
			)
		}
	</div>);
});

export default EditPanel;