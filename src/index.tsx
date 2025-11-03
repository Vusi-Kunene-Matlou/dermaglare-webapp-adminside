// src/index.js (or main.tsx / index.tsx)

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // Or your AdminDashboard component
import "./index.css";

// REMOVE this line: import { firebaseConfig } from "./firebaseConfig";
// REMOVE other firebase imports here too. They belong in the components that use them.

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
