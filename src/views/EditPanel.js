import React from "react";

import { observer } from "mobx-react-lite";

import EditOperations from "../components/panel/EditOperations";
import OperationPanel from "../components/panel/OperationPanel";

const EditPanel = observer(function EditPanel() {

	return (<div className="flex flex-col">
		<EditOperations />
		<OperationPanel />
	</div>);
});

export default EditPanel;