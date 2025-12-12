import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Shim process.env for the Google GenAI SDK
(window as any).process = {
  env: {
    API_KEY: "AIzaSyBjMZir3Vm9fHVyypojOrW2YLFSTwhPJ2c"
  }
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);