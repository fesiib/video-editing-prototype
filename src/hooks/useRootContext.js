import { useContext } from "react";
import { RootContext } from "../contexts/RootContext";

function useRootContext() {
    const rootStore = useContext(RootContext);
    return {
        uiStore: rootStore.uiStore,
        domainStore: rootStore.domainStore,
		userStore: rootStore.userStore,
    };
}

export default useRootContext;
