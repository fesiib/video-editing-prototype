import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import Provider from "./Provider";
import GPTLike from "./apps/GPTLike";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Blocks from "./apps/Blocks";

import ChatAppTemplate from "./apps/ChatAppTemplate";

const root = ReactDOM.createRoot(document.getElementById("root"));

const router = createBrowserRouter([
    {
        path: "/blocks",
        element: <Blocks />,
    },
    {
        path: "/",
        element: <ChatAppTemplate />,
    },
    {
        path: "/app",
        element: <App />,
    },
]);

// gptlike
root.render(
    <React.StrictMode>
        <Provider>
            <RouterProvider router={router} />
        </Provider>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
