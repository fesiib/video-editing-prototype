import { createContext } from "react";
import RootStore from "../stores/rootStore";

export const RootContext = createContext(null);

function RootContextProvider({
	children
}) {
	return (<RootContext.Provider value={new RootStore()}>
		{children}
	</RootContext.Provider>);
}

export default RootContextProvider;