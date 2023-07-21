import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import {BrowserRouter} from "react-router-dom"
import "./styles/globals.css";

createRoot(document.getElementById("root") as Element).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
  
);



