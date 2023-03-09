import { useContext } from "react";
import { RootContext } from "../contexts/RootContext";

function useRootContext() {
    const rootStore = useContext(RootContext);
    return {
        uiStore: rootStore.uiStore,
        domainStore: rootStore.domainStore,
    };
}

export default useRootContext;
