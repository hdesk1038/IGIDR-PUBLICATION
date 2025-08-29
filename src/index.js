import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "../public/index.css"; // TailwindCSS imports are inside here

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
