import "./index.css";

import ReactDOM from "react-dom/client";
// IMP START - Setup Web3Auth Provider
import { Web3AuthProvider } from "@web3auth/modal/react";
import web3AuthContextConfig from "./web3authContext";
// IMP END - Setup Web3Auth Provider
import { Toaster } from 'react-hot-toast';

import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  // IMP START - Setup Web3Auth Provider
  <Web3AuthProvider config={web3AuthContextConfig}>
        <App />
        <Toaster 
          position="bottom-center"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#1f2937',
              color: '#f3f4f6',
              border: '1px solid #374151',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#f3f4f6',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#f3f4f6',
              },
            },
          }}
        />
  </Web3AuthProvider>
  // IMP END - Setup Web3Auth Provider
);
