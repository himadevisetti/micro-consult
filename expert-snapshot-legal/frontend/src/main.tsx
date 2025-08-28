// src/main.tsx
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import './styles/global.css';

function Root() {
  useEffect(() => {
    if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
      document.documentElement.classList.add('is-safari');
    }
  }, []);

  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);