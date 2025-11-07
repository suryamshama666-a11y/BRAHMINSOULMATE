// Load external dev-only tooling when running the Vite dev server
if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_GPTENGINEER !== '0') {
  const s = document.createElement('script');
  s.type = 'module';
  s.src = 'https://cdn.gpteng.co/gptengineer.js';
  document.head.appendChild(s);
}

