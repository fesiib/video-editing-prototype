import React, { useEffect, useState } from "react";

import { observer } from "mobx-react-lite";
import { action, observe, reaction, toJS } from "mobx";

import useRootContext from "../hooks/useRootContext";
import NewIntent from "../components/general/NewIntent";
import NewTab from "../components/general/NewTab";

const TabsWindow = observer(function SideHistory() {
	const { userStore, uiStore, domainStore } = useRootContext();
	const systemSetting = userStore.systemSetting;
	const curTab = domainStore.tabs[domainStore.curTabPos];
	const reversedTabs = Array.from(domainStore.tabs).reverse();

	const [collapsed, setCollapsed] = useState(true);

	return (<div 
		className={"absolute overflow-y-scroll bg-gray-100 divide-y divide-gray-400 h-full z-30"
			+ (collapsed ? " w-full" : " w-64")
		}
		onMouseEnter={() => setCollapsed(false)}
		onMouseLeave={() => setCollapsed(true)}
	>
		<div className="p-1">
			<NewTab collapsed={collapsed} />
		</div>

			{domainStore.tabs.map((_, idx) => {
				const tab = domainStore.tabs[idx];
				return (<div>
					{tab.title}
				</div>);
			}).reverse()}
	</div>);
});

export default TabsWindow;