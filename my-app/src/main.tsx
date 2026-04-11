import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PrimeReactProvider } from "primereact/api";
import "./index.css";
// Import PrimeReact styles
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primeicons/primeicons.css";

import App from "./App.tsx";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider
      clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "dummy-client-id"}
    >
      <QueryClientProvider client={queryClient}>
        <PrimeReactProvider>
          <App />
        </PrimeReactProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
