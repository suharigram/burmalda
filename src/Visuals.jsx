import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const ProductScene = dynamic(() => import('./ThreeVisuals.jsx').then((module) => module.ProductScene), { ssr: false });
const currentTheme = () => document.documentElement.dataset.theme || 'dark';

export function Brand({ light = false }) {
  const [theme, setTheme] = useState('dark');
  useEffect(() => {
    setTheme(currentTheme());
    const observer = new MutationObserver(() => setTheme(currentTheme()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);
  const inverted = light || theme === 'dark';
  return (
    <span className={`brand ${light ? 'brand--light' : ''}`} aria-label="Clod Le Grade">
      <img className="brand__mark" src={inverted ? '/logo-white.png' : '/logo.png'} alt="" width="330" height="247" />
      <span className="brand__word">Clod Le Grade</span>
    </span>
  );
}

export function HeroProcessor() {
  return <div className="hero-processor"><Suspense fallback={null}><ProductScene /></Suspense></div>;
}

export function ProductArt({ type = 'processor' }) {
  return <div className="product-art"><Suspense fallback={null}><ProductScene type={type} /></Suspense></div>;
}

export function RackVisual() {
  return <div className="rack-visual"><Suspense fallback={null}><ProductScene type="server" /></Suspense></div>;
}
