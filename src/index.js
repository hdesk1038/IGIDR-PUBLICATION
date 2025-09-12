import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "../public/index.css"; // TailwindCSS imports are inside here
import { createBrowserRouter, RouterProvider } from "react-router";
import Description from "./Description";

const root = ReactDOM.createRoot(document.getElementById("root"));

const appRouter = createBrowserRouter([
    {
        path: "/",
        element: <App />,
    }, {
        path: "/description",
        element: <Description />,
    }
]);
root.render(
    <React.StrictMode>
        <RouterProvider router={appRouter} />
    </React.StrictMode>
);
