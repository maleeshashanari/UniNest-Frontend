
import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";

import App from "./App";
import "./index.css";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={googleClientId}>
            <App />

            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000
                }}
            />
        </GoogleOAuthProvider>
    </React.StrictMode>
);
