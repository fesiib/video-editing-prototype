import { observer } from "mobx-react-lite";

import "./App.css";
import EditorCanvas from "./components/EditorCanvas";
import RootStore from "./stores/rootStore";

const rootStore = new RootStore();

const App = observer(function App() {
    const uiStore = rootStore.uiStore;
    const domainStore = rootStore.domainStore;
    return (
        <div className="App">
            <h1 className="text-3xl font-bold underline">Hello !</h1>
			<div className="grid m-10 grid-cols-3 grid-rows-3">
				<EditorCanvas 
					className={"col-start-2 col-span-2 row-span-2 overflow-hidden"}
					uiStore={uiStore}
					domainStore={domainStore} 
				/>
			</div>
        </div>
    );
});

export default App;
