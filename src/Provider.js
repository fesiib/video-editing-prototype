import RootContextProvider from "./contexts/RootContext";

function Provider({
	children
}) {
	return (
		<RootContextProvider>
			{children}
		</RootContextProvider>
	);
}

export default Provider;