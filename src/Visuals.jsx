import { lazy, Suspense, useEffect, useState } from 'react';

const ProductScene = lazy(() => import('./ThreeVisuals.jsx').then((module) => ({ default: module.ProductScene })));

const currentTheme = () => document.documentElement.dataset.theme || 'light';

export function Brand({ light = false }) {
  const [theme, setTheme] = useState(currentTheme);
  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(currentTheme()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);
  const inverted = light || theme === 'dark';
  return (
    <span className={`brand ${light ? 'brand--light' : ''}`} aria-label="GonidonCloud">
      <img className="brand__mark" src={inverted ? '/logo-white.png' : '/logo.png'} alt="" width="330" height="247" />
      <span className="brand__word">Gonidon<span>Cloud</span></span>
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
