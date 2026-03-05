import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./responsive.css";

// Global resets & styles
const style = document.createElement("style");
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; }
  html { scroll-behavior: smooth; font-size: 16px; }
  body { margin: 0; padding: 0; font-family: 'Inter', system-ui, -apple-system, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #0a0a0a; background: #ffffff; line-height: 1.6; }
  a { text-decoration: none; }
  input, button, select, textarea { font-family: inherit; }
  img { max-width: 100%; display: block; }
  button { cursor: pointer; }
  ::selection { background: #d97706; color: #fff; }
  input:focus, textarea:focus, select:focus { border-color: #d97706 !important; box-shadow: 0 0 0 4px rgba(217,119,6,0.1) !important; outline: none !important; }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(60px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
  .fade-in { animation: fadeInUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }
  .stagger-1 { animation-delay: 0.1s; }
  .stagger-2 { animation-delay: 0.2s; }
  .stagger-3 { animation-delay: 0.3s; }
  .stagger-4 { animation-delay: 0.4s; }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
