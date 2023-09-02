import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import Provider from "./Provider";
import GPTLike from "./apps/GPTLike";

const root = ReactDOM.createRoot(document.getElementById("root"));

// root.render(
// 	<Provider>
// 		<App />
// 	</Provider>
// );


// default
// root.render(
//     <React.StrictMode>
//         <Provider>
//             <App />
//         </Provider>
//     </React.StrictMode> 
// );


// gptlike
root.render(
    <React.StrictMode>
        <Provider>
            <GPTLike />
        </Provider>
    </React.StrictMode> 
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
