import { action } from "mobx";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

import "./App.css";
import EditorCanvas from "./components/EditorCanvas";
import Timeline from "./components/Timeline";
import RootStore from "./stores/rootStore";

const rootStore = new RootStore();

const App = observer(function App() {
    const uiStore = rootStore.uiStore;
    const domainStore = rootStore.domainStore;

	useEffect(action(() => {
		uiStore.setWindowSize({
			width: window.innerWidth,
			height: window.innerHeight,
		});
	}), []);

    return (
        <div className="App">
            <h1 className="text-3xl font-bold underline">Hello !</h1>
            <div className="flex flex-row flex-nowrap m-10">
				<div className="flex-col basis-1/3">
					<h1> PANEL </h1>
				</div>
				<div className="flex-col grow basis-2/3 gap-10">
					<div className={"basis-1/3"}>
						<Timeline uiStore={uiStore} domainStore={domainStore} />
					</div>
					<div className={"basis-2/3"}>
						<EditorCanvas uiStore={uiStore} domainStore={domainStore} />
					</div>
				</div>
            </div>
        </div>
    );
});

export default App;
