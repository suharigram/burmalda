import { useEffect, useState } from 'react';
import { ArrowRight, Check, Cookie, X } from 'lucide-react';
import Modal from './Modal.jsx';

const STORAGE_KEY = 'gc-cookie-consent';
const defaults = { necessary: true, functional: false, analytics: false, advertising: false };

function savedPreferences() {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) }; }
  catch { return defaults; }
}

export default function CookieManager({ settingsOpen, onOpenSettings, onCloseSettings }) {
  const [showBanner, setShowBanner] = useState(() => !localStorage.getItem(STORAGE_KEY));
  const [preferences, setPreferences] = useState(savedPreferences);

  useEffect(() => {
    if (settingsOpen) setPreferences(savedPreferences());
  }, [settingsOpen]);

  const save = (choices) => {
    const value = { ...choices, necessary: true, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('gc:consent', { detail: value }));
    setPreferences(value);
    setShowBanner(false);
    onCloseSettings();
  };

  return (
    <>
      {showBanner && !settingsOpen && <section className="cookie-banner" aria-label="Cookie notice"><div className="cookie-banner__icon"><Cookie size={23} /></div><div className="cookie-banner__content"><h2>A little data. A better experience.</h2><p>We use necessary storage to run the site and remember your theme. With your permission, we may use optional analytics to improve it. Read our <a href="#/legal/cookies">Cookies Policy</a>.</p><div className="cookie-banner__actions"><button className="button button--red" onClick={() => save({ necessary: true, functional: true, analytics: true, advertising: true })}>Accept all</button><button className="button cookie-banner__secondary" onClick={() => save(defaults)}>Reject optional</button><button className="cookie-banner__manage" onClick={onOpenSettings}>Manage settings <ArrowRight size={14} /></button></div></div><button className="cookie-banner__close" onClick={() => save(defaults)} aria-label="Reject optional cookies and close"><X size={18} /></button></section>}
      {settingsOpen && <Modal onClose={onCloseSettings} label="Cookie Settings" className="cookie-modal"><span className="eyebrow eyebrow--red">YOUR PRIVACY CHOICES</span><h2>Cookie Settings</h2><p>Choose which optional technologies you allow. Necessary storage keeps the site secure and remembers choices such as your theme. Your selection is saved on this device.</p><div className="cookie-preferences"><div className="cookie-preference"><div><h3>Strictly necessary</h3><p>Security, forms, load balancing, and privacy preferences.</p></div><span className="cookie-always"><Check size={14} /> Always on</span></div>{[['functional', 'Functional', 'Optional conveniences and enhanced site preferences.'], ['analytics', 'Analytics', 'Aggregated measurement that helps us understand and improve site use.'], ['advertising', 'Advertising', 'Campaign measurement and personalized communications, if enabled.']].map(([key, title, text]) => <div className="cookie-preference" key={key}><div><h3>{title}</h3><p>{text}</p></div><button className={`cookie-switch ${preferences[key] ? 'on' : ''}`} role="switch" aria-checked={preferences[key]} aria-label={`${title} cookies`} onClick={() => setPreferences((current) => ({ ...current, [key]: !current[key] }))}><span /></button></div>)}</div><div className="cookie-modal__actions"><button className="button button--red" onClick={() => save(preferences)}>Save preferences</button><button className="button cookie-banner__secondary" onClick={() => save({ necessary: true, functional: true, analytics: true, advertising: true })}>Accept all</button></div><a className="cookie-modal__policy" href="#/legal/cookies" onClick={onCloseSettings}>Read the full Cookies Policy <ArrowRight size={14} /></a></Modal>}
    </>
  );
}
