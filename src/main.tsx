import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./app-components/auth/AuthProvider";
import { ToastProvider } from "./components/ToastProvider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <App/>
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>,
);
