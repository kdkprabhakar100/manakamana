import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./responsive.css";

// Global resets & styles
const style = document.createElement("style");
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin: 0; padding: 0; font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #1e293b; background: #ffffff; }
  a { text-decoration: none; }
  input, button, select, textarea { font-family: inherit; }
  img { max-width: 100%; display: block; }
  button { cursor: pointer; }
  ::selection { background: #f97316; color: #fff; }
  input:focus, textarea:focus, select:focus { border-color: #f97316 !important; box-shadow: 0 0 0 3px rgba(249,115,22,0.15) !important; outline: none !important; }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  .fade-in { animation: fadeInUp 0.5s ease-out both; }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
