import { action } from "mobx";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

import "./App.css";
import EditorCanvas from "./views/EditorCanvas";
import Timeline from "./views/Timeline";

import useRootContext from "./hooks/useRootContext";

const App = observer(function App() {
    const { uiStore } = useRootContext();

    useEffect(
        action(() => {
            uiStore.setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }),
        [window.innerWidth, window.innerHeight]
    );

    return (
        <div className="App">
            <h1 className="text-3xl font-bold underline">Hello !</h1>
            <div className="flex flex-row flex-nowrap m-10">
                <div className="flex-col basis-1/3">
                    <h1> PANEL </h1>
                </div>
                <div className="flex-col grow basis-2/3 gap-10">
                    <div className={"basis-1/3"}>
                        <Timeline />
                    </div>
                    <div className={"basis-2/3"}>
                        <EditorCanvas />
                    </div>
                </div>
            </div>
        </div>
    );
});

export default App;
