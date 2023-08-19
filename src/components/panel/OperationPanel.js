import React from "react";

import { observer } from "mobx-react-lite";

import useRootContext from "../../hooks/useRootContext";

const OperationPanel = observer(function OperationPanel() {

	const { uiStore } = useRootContext();

	return (<div className="flex flex-col items-center p-1 m-1 border">
		<h2> Operation Panel</h2>
		<span> Spatial </span>
		<span> Temporal </span>
		<span> Custom Parameters </span>
	</div>);
});

export default OperationPanel;