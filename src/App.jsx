import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import {
  ArrowRight, ArrowUp, ArrowUpRight, BrainCircuit, Check, ChevronDown,
  AlertCircle, Cloud, Cpu, Database, Github, Globe2, Layers3, Leaf, Linkedin,
  Menu, MessageSquare, Moon, Search, Send, Server, ShieldCheck, ShoppingBag, Sun, UserRound, X,
  Youtube, Zap,
} from 'lucide-react';
import { Brand, HeroProcessor, ProductArt, RackVisual } from './Visuals.jsx';
import DetailPage from './DetailPage.jsx';
import Modal from './Modal.jsx';
import LegalPage from './LegalPage.jsx';
import CookieManager from './CookieManager.jsx';
import { CheckoutPage, OrderResultPage, StorePage } from './CommercePage.jsx';
import { AccountPage, LoginPage } from './AccountPage.jsx';
import DriversPage from './DriversPage.jsx';
import { getPage, linkRoutes } from './siteData.js';
import { legalDocuments } from './legalData.js';

const ThreeBackground = lazy(() => import('./ThreeVisuals.jsx'));

const routeFromHash = () => {
  const hash = window.location.hash;
  if (hash.startsWith('#/')) return hash.slice(1).split('?')[0].replace(/\/+$/, '') || '/';
  return window.location.pathname.replace(/\/+$/, '') || '/';
};

const navigation = [
  {
    label: 'Products',
    sidebar: true,
    columns: [
      { title: 'Compute', links: ['FPU Apollon 1100 Server Processors', 'FPU 1100 AI Accelerators', 'FPU Force 1100 Server GPUs'] },
      { title: 'Systems', links: ['FlowForce W 1100 Workstation', 'FlowForce E 1100 Edge System', 'FlowSystem R 1100 Enterprise Servers'] },
      { title: 'Software & Tools', links: ['Cloud Platform', 'Developer Hub', 'Documentation', 'Drivers & Downloads'] },
    ],
    feature: { eyebrow: 'PRE-ORDER', title: 'FPU Apollon 1100', text: 'Our most advanced server processor yet.', target: '/products/fpu-apollon-1100' },
  },
  {
    label: 'Enterprise',
    sidebar: true,
    columns: [
      { title: 'Compute Enterprise', links: ['FPU Apollon 1100 Enterprise', 'FPU 1100 Enterprise', 'FPU Force 1100 Enterprise'] },
      { title: 'Systems Enterprise', links: ['FlowForce W 1100 Enterprise', 'FlowForce E 1100 Enterprise', 'FlowSystem R 1100 Enterprise'] },
    ],
    feature: { eyebrow: 'ENTERPRISE', title: 'Built around your deployment.', text: 'Validated configurations, volume procurement, and dedicated engineering support.', target: '/enterprise/flowsystem-r-1100' },
  },
  {
    label: 'Solutions',
    sidebar: true,
    columns: [
      { title: 'By workload', links: ['Artificial Intelligence', 'Cloud Computing', 'High-Performance Computing', 'Data Analytics'] },
      { title: 'By industry', links: ['Financial Services', 'Healthcare & Life Sciences', 'Manufacturing', 'Telecommunications'] },
    ],
    feature: { eyebrow: 'SOLUTIONS', title: 'AI, end to end.', text: 'Open infrastructure for every AI ambition.', target: '/solutions/ai' },
  },
  {
    label: 'Resources',
    sidebar: true,
    columns: [
      { title: 'Explore', links: ['Documentation', 'Developer Hub', 'Partner Network'] },
      { title: 'Support', links: ['Support Center', 'Drivers & Downloads', 'Warranty Services', 'Contact an Expert'] },
    ],
    feature: { eyebrow: 'DEVELOPERS', title: 'Build on open.', text: 'Tools and documentation to move faster.', target: '/resources/developer-hub' },
  },
  {
    label: 'Company',
    sidebar: true,
    columns: [
      { title: 'GonidonCloud', links: ['About Us', 'Leadership', 'Newsroom', 'Careers', 'Contact us'] },
      { title: 'Our commitments', links: ['Corporate Responsibility', 'Sustainability', 'Diversity & Inclusion', 'Supplier Hub'] },
    ],
    feature: { eyebrow: 'OUR PURPOSE', title: 'Compute for good.', text: 'Technology should move everyone forward.', target: '/company/about' },
  },
];

const products = [
  {
    type: 'processor', eyebrow: 'GONIDONCLOUD FPU APOLLON 1100™', title: 'Server Processors',
    text: 'High-density host compute, powerful standalone or paired with FPU 1100 AI acceleration.',
    link: 'Explore Apollon processors', target: '/products/fpu-apollon-1100', tag: 'PRE-ORDER: SHIPS Q1 2027',
  },
  {
    type: 'accelerator', eyebrow: 'GONIDONCLOUD FPU 1100™', title: 'AI Accelerators',
    text: 'Flow Processing Unit acceleration for training and inference, backed by an open software ecosystem.',
    link: 'Explore FPU 1100', target: '/products/fpu-1100', tag: 'OPEN BY DESIGN',
  },
  {
    type: 'accelerator', eyebrow: 'GONIDONCLOUD FPU FORCE 1100™', title: 'Server GPUs',
    text: 'A dedicated graphics family for visualization, parallel processing, and virtual graphics infrastructure.',
    link: 'Explore Force server GPUs', target: '/products/fpu-force-1100', tag: 'SERVER GRAPHICS',
  },
];

const searchItems = [
  { title: 'FPU Apollon 1100 Server Processors', category: 'Product', target: '/products/fpu-apollon-1100' },
  { title: 'FlowForce W 1100 Workstation', category: 'Product', target: '/systems/flowforce-w-1100' },
  { title: 'FlowForce E 1100 Edge System', category: 'Product', target: '/systems/flowforce-e-1100' },
  { title: 'FlowSystem R 1100 Enterprise Servers', category: 'Product', target: '/systems/flowsystem-r-1100' },
  { title: 'FPU 1100 AI Accelerators', category: 'Product', target: '/products/fpu-1100' },
  { title: 'FPU Force 1100 Server GPUs', category: 'Product', target: '/products/fpu-force-1100' },
  { title: 'AI Infrastructure Solutions', category: 'Solution', target: '/solutions/ai' },
  { title: 'Cloud Computing Solutions', category: 'Solution', target: '/solutions/cloud' },
  { title: 'Documentation & Developer Resources', category: 'Resource', target: 'https://gonidoncloud.github.io/fpu-documentation/' },
  { title: 'GonidonCloud Newsroom', category: 'Company', target: '/company/newsroom' },
  { title: 'Contact an Expert', category: 'Support', target: 'contact' },
];

const news = [
  {
    date: 'October 21, 2026', type: 'PRODUCT NEWS',
    title: 'GonidonCloud introduces FPU Apollon 1100 processors for the next era of compute',
    text: 'The new FPU Apollon 1100 family brings leadership core density, next-generation memory, and advanced security to cloud and enterprise data centers.',
    art: 'chip',
  },
  {
    date: 'October 08, 2026', type: 'PARTNERSHIP',
    title: 'Building the open AI ecosystem with the industry’s leading innovators',
    text: 'New collaborations across software, networking, and infrastructure make it easier for customers to deploy open, scalable AI platforms.',
    art: 'network',
  },
  {
    date: 'September 24, 2026', type: 'COMPANY NEWS',
    title: 'Our new global engineering center puts sustainable computing first',
    text: 'The new facility brings together silicon design, systems engineering, and advanced research under one roof.',
    art: 'building',
  },
  {
    date: 'September 10, 2026', type: 'ENGINEERING',
    title: 'One team, one architecture: how GonidonCloud is rethinking compute',
    text: 'Our silicon, systems, and software engineers are working side by side to create a more coherent platform—and remove the compromises that slow ambitious teams down.',
    art: 'chip',
  },
  {
    date: 'August 28, 2026', type: 'COMPANY NEWS',
    title: 'Built by people who believe ambitious ideas deserve better infrastructure',
    text: 'Meet the builders turning our open-compute vision into a growing family of processors, accelerators, and systems designed around real customer needs.',
    art: 'network',
  },
  {
    date: 'August 12, 2026', type: 'SUSTAINABILITY',
    title: 'Engineering a more efficient future, one design decision at a time',
    text: 'From architecture to system planning, our teams are making efficiency part of the design process as we work toward more sustainable computing.',
    art: 'building',
  },
];

function Header({ onSearch, onContact, theme, onToggleTheme, user }) {
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeProductTab, setActiveProductTab] = useState('Compute');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState(null);
  const [announcement, setAnnouncement] = useState(true);
  const headerRef = useRef(null);

  useEffect(() => {
    const handleClick = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) setActiveMenu(null);
    };
    document.addEventListener('pointerdown', handleClick);
    return () => document.removeEventListener('pointerdown', handleClick);
  }, []);

  const closeMenus = () => {
    setActiveMenu(null);
    setMobileOpen(false);
  };

  return (
    <>
      {announcement && (
        <div className="announcement">
          <div className="container announcement__inner">
            <span><strong>FPU Apollon 1100 pre-orders are open</strong><span className="announcement__divider" /><span className="announcement__message">Reserve our flagship processor. First shipments Q1 2027.</span></span>
            <a className="announcement__cta" href="#/products/fpu-apollon-1100">Pre-order <ArrowUpRight size={13} /></a>
            <button className="announcement__close" onClick={() => setAnnouncement(false)} aria-label="Dismiss announcement"><X size={15} /></button>
          </div>
        </div>
      )}
      <header className="site-header" ref={headerRef}>
        <div className="container header__inner">
          <a href="#/" className="header__brand" aria-label="GonidonCloud home" onClick={closeMenus}><Brand /></a>
          <a className="header__github" href="https://github.com/gonidoncloud" target="_blank" rel="noreferrer"><Github size={16} /> Open source</a>
          <nav className="desktop-nav" aria-label="Main navigation">
            {navigation.map((item) => (
              <button key={item.label} className={activeMenu === item.label ? 'active' : ''} onClick={() => { setActiveMenu(activeMenu === item.label ? null : item.label); setActiveProductTab(item.columns[0].title); }} aria-expanded={activeMenu === item.label}>
                {item.label}<ChevronDown size={14} />
              </button>
            ))}
          </nav>
          <div className="header__actions">
            <button className="header__search-link" onClick={onSearch}><Search size={16} /> Search</button>
            <a className="header__signin" href={user ? '#/account' : '#/login'}>{user ? 'My account' : 'Sign in'}</a>
            <button className="header__contact" onClick={onContact}>Contact sales</button>
            <a className="header__get-started" href="#/store">Get Started <ArrowUpRight size={15} /></a>
            <button className="icon-button mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation" aria-expanded={mobileOpen}>{mobileOpen ? <X /> : <Menu />}</button>
          </div>
        </div>

        {activeMenu && (
          <div className="mega-menu">
            <div className="container mega-menu__inner">
              <div className="mega-menu__heading"><span>{activeMenu}</span><button onClick={() => setActiveMenu(null)} aria-label="Close menu"><X size={20} /></button></div>
              {navigation.filter((item) => item.label === activeMenu).map((item) => (
                <div className={`mega-menu__content ${item.sidebar ? 'mega-menu__content--sidebar' : ''}`} key={item.label}>
                  {item.sidebar && <div className="mega-menu__tabs" role="tablist" aria-label="Product categories">
                    {item.columns.map((column) => <button key={column.title} className={activeProductTab === column.title ? 'active' : ''} onClick={() => setActiveProductTab(column.title)} role="tab" aria-selected={activeProductTab === column.title}>{column.title}<ArrowRight size={16} /></button>)}
                  </div>}
                  <div className="mega-menu__columns">
                    {item.columns.filter((column) => !item.sidebar || column.title === activeProductTab).map((column) => (
                      <div className="mega-menu__column" key={column.title}>
                        {!item.sidebar && <h3>{column.title}</h3>}
                        {column.links.map((link) => link === 'Contact an Expert' ? <button key={link} onClick={() => { closeMenus(); onContact(); }}>{link}<ArrowUpRight size={14} /></button> : <a key={link} href={linkRoutes[link]?.startsWith('http') ? linkRoutes[link] : `#${linkRoutes[link]}`} target={linkRoutes[link]?.startsWith('http') ? '_blank' : undefined} rel={linkRoutes[link]?.startsWith('http') ? 'noreferrer' : undefined} onClick={closeMenus}>{link}<ArrowUpRight size={14} /></a>)}
                      </div>
                    ))}
                  </div>
                  <a className="mega-menu__feature" href={`#${item.feature.target}`} onClick={closeMenus}>
                    <div className="mega-menu__feature-art"><Cpu size={54} strokeWidth={1} /><span /></div>
                    <div><span className="eyebrow">{item.feature.eyebrow}</span><h3>{item.feature.title}</h3><p>{item.feature.text}</p><span className="text-link">Learn more <ArrowRight size={15} /></span></div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      <div className={`mobile-menu ${mobileOpen ? 'mobile-menu--open' : ''}`}>
        <div className="mobile-menu__links">
          <div className="mobile-menu__utilities">
            <button onClick={() => { closeMenus(); onSearch(); }}><Search size={16} /> Search</button>
            <a href={user ? '#/account' : '#/login'} onClick={closeMenus}><UserRound size={16} /> {user ? 'My account' : 'Sign in'}</a>
          </div>
          {navigation.map((item, index) => (
            <div className="mobile-menu__section" key={item.label}>
              <button onClick={() => setMobileSection(mobileSection === index ? null : index)} aria-expanded={mobileSection === index}>{item.label}<ChevronDown className={mobileSection === index ? 'rotated' : ''} /></button>
              {mobileSection === index && <div className="mobile-menu__sub">{item.columns.flatMap((column) => column.links).map((link) => link === 'Contact an Expert' ? <button key={link} onClick={() => { closeMenus(); onContact(); }}>{link}</button> : <a key={link} href={linkRoutes[link]?.startsWith('http') ? linkRoutes[link] : `#${linkRoutes[link]}`} target={linkRoutes[link]?.startsWith('http') ? '_blank' : undefined} rel={linkRoutes[link]?.startsWith('http') ? 'noreferrer' : undefined} onClick={closeMenus}>{link}</a>)}</div>}
            </div>
          ))}
          <button className="mobile-menu__contact" onClick={() => { setMobileOpen(false); onContact(); }}>Talk to an engineer <ArrowRight size={17} /></button>
          <div className="mobile-menu__locale"><Globe2 size={17} /> Global — English</div>
        </div>
      </div>
      {(activeMenu || mobileOpen) && <div className="nav-scrim" onClick={() => { setActiveMenu(null); setMobileOpen(false); }} />}
    </>
  );
}

function ContactModal({ onClose }) {
  const [status, setStatus] = useState('idle');
  const [requestId, setRequestId] = useState('');
  const [error, setError] = useState('');
  const submit = async (event) => {
    event.preventDefault();
    setStatus('submitting'); setError('');
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch('/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Your inquiry could not be sent.');
      setRequestId(result.requestId); setStatus('success');
    } catch (requestError) {
      setError(requestError.message || 'The form is temporarily unavailable. Please email sales@gonidoncloud.com.');
      setStatus('error');
    }
  };
  return (
    <Modal onClose={onClose} label="Contact GonidonCloud" className="contact-modal">
      {status !== 'success' ? (
        <>
          <span className="eyebrow eyebrow--red">LET'S BUILD TOGETHER</span>
          <h2>Talk to an engineer.</h2>
          <p>Tell us about your workload. Your request is securely sent to our infrastructure team.</p>
          <form className="contact-form" onSubmit={submit}>
            <div className="form-row"><label>First name<input name="firstName" autoComplete="given-name" required maxLength="80" /></label><label>Last name<input name="lastName" autoComplete="family-name" required maxLength="80" /></label></div>
            <label>Work email<input name="email" type="email" autoComplete="email" placeholder="you@company.com" required maxLength="254" /></label>
            <label>Company<input name="company" autoComplete="organization" required maxLength="160" /></label>
            <label>What are you building?<select name="interest" defaultValue="" required><option value="" disabled>Select your area of interest</option><option>AI infrastructure</option><option>Cloud computing</option><option>High-performance computing</option><option>Enterprise data center</option><option>Privacy or legal request</option><option>Other</option></select></label>
            <label>How can we help?<textarea name="message" rows="3" placeholder="Tell us a little about your project" maxLength="5000" /></label>
            <label className="form-honeypot" aria-hidden="true">Website<input name="website" tabIndex="-1" autoComplete="off" /></label>
            <label className="contact-form__consent"><input type="checkbox" name="privacyConsent" value="true" required /><span>I have read the <a href="#/legal/privacy" target="_blank">Privacy Policy</a> and consent to being contacted about this inquiry.</span></label>
            {error && <div className="form-error" role="alert"><AlertCircle size={18} /><span>{error} You can also email <a href="mailto:sales@gonidoncloud.com">sales@gonidoncloud.com</a>.</span></div>}
            <button className="button button--red" type="submit" disabled={status === 'submitting'}>{status === 'submitting' ? 'Sending securely…' : 'Send inquiry'}<ArrowRight size={17} /></button>
            <small>Encrypted in transit. We use your details only to respond and meet our legal obligations.</small>
          </form>
        </>
      ) : (
        <div className="form-success"><span><Check size={32} /></span><h2>We’re on it.</h2><p>Your inquiry was received. Reference <strong>{requestId}</strong>. A GonidonCloud engineer will respond within one business day.</p><button className="button button--dark" onClick={onClose}>Back to the site</button></div>
      )}
    </Modal>
  );
}

function SearchModal({ onClose, onContact }) {
  const [query, setQuery] = useState('');
  const results = searchItems.filter((item) => `${item.title} ${item.category}`.toLowerCase().includes(query.toLowerCase()));
  const goTo = (target) => { onClose(); setTimeout(() => target === 'contact' ? onContact() : target.startsWith('http') ? window.open(target, '_blank', 'noopener,noreferrer') : (window.location.hash = target), 50); };
  return (
    <Modal onClose={onClose} label="Search GonidonCloud" className="search-modal">
      <div className="search-modal__brand"><Brand /></div>
      <div className="search-field"><Search size={25} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="What are you looking for?" aria-label="Search query" />{query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={19} /></button>}</div>
      <div className="search-results">
        <div className="search-results__label">{query ? `${results.length} RESULT${results.length === 1 ? '' : 'S'}` : 'POPULAR RIGHT NOW'}</div>
        {(query ? results : searchItems.slice(0, 4)).map((item) => <button key={item.title} onClick={() => goTo(item.target)}><span><small>{item.category}</small>{item.title}</span><ArrowUpRight size={20} /></button>)}
        {query && !results.length && <div className="search-empty"><Search size={32} /><h3>No results for “{query}”</h3><p>Try a product name, solution, or resource.</p></div>}
      </div>
    </Modal>
  );
}

function ArchitectureModal({ onClose }) {
  return (
    <Modal onClose={onClose} label="FPU Apollon 1100 architecture" className="architecture-modal">
      <span className="eyebrow eyebrow--red">FPU Apollon 1100 ARCHITECTURE</span><h2>More performance.<br />Less compromise.</h2><p>FPU Apollon 1100 combines high-density compute chiplets, a next-generation I/O die, and hardware-enforced security in one scalable platform.</p>
      <div className="architecture-grid"><div><Cpu /><h3>??? cores</h3><p>High-density FPU compute chiplets built for demanding, parallel workloads.</p></div><div><Database /><h3>??? memory channels</h3><p>High-bandwidth DDR5 memory keeps data moving to every core.</p></div><div><Layers3 /><h3>??? PCIe® lanes</h3><p>Flexible, high-speed connectivity for accelerators, storage, and networking.</p></div><div><ShieldCheck /><h3>Security at the core</h3><p>Hardware-rooted trust and memory encryption help protect critical data.</p></div></div>
      <a className="button button--red" href="#/products/fpu-apollon-1100" onClick={onClose}>Explore the platform <ArrowRight size={17} /></a>
    </Modal>
  );
}

function ComputeConsole() {
  return (
    <div className="compute-console" aria-label="GonidonCloud platform console">
      <div className="compute-console__bar"><div><span /><span /><span /></div><small>gonidoncloud / platform</small><span>⌘ K</span></div>
      <div className="compute-console__body">
        <div className="compute-console__command"><span>~</span><code>fpu status --cluster production</code><i>RUNNING</i></div>
        <div className="compute-console__grid">
          <div><small>HOST COMPUTE</small><strong>FPU Apollon 1100</strong><span><i /> Ready for pre-order</span></div>
          <div><small>AI ACCELERATION</small><strong>FPU 1100</strong><span><i /> Open software stack</span></div>
          <div><small>DEPLOYMENT</small><strong>FlowSystem R 1100</strong><span><i /> Q1 2027</span></div>
        </div>
        <div className="compute-console__output"><span>01</span><code>Silicon, systems, and software. One open platform.</code><strong>CONNECTED</strong></div>
      </div>
    </div>
  );
}

function App() {
  const [route, setRoute] = useState(routeFromHash);
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light');
  const [cookieSettingsOpen, setCookieSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [architectureOpen, setArchitectureOpen] = useState(false);
  const [activeArticle, setActiveArticle] = useState(null);
  const [solution, setSolution] = useState('AI');
  const [showTop, setShowTop] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me').then((response) => response.json()).then((data) => setUser(data.user)).catch(() => {});
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('gc-theme', theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0b0c0f' : '#ffffff');
  }, [theme]);

  useEffect(() => {
    const handleRoute = () => {
      setRoute(routeFromHash());
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    window.addEventListener('hashchange', handleRoute);
    return () => window.removeEventListener('hashchange', handleRoute);
  }, []);

  useEffect(() => {
    const page = route === '/' ? null : getPage(route);
    const legalPage = legalDocuments[route];
    const title = route === '/legal' ? 'Legal & Compliance' : route === '/store' ? 'Store' : route.startsWith('/checkout/') ? 'Secure Checkout' : route.startsWith('/order/') ? 'Order Status' : null;
    document.title = page || legalPage ? `${page?.title || legalPage?.title} | GonidonCloud` : title ? `${title} | GonidonCloud` : route === '/' ? 'GonidonCloud — Compute Without Limits' : 'Page Not Found | GonidonCloud';
    const description = page?.description || legalPage?.summary || 'GonidonCloud builds high-performance processors, AI accelerators, and rack-scale systems for AI, cloud, HPC, and data analytics.';
    const privatePage = route === '/account' || route === '/login' || route.startsWith('/checkout/') || route.startsWith('/order/');
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('meta[name="robots"]')?.setAttribute('content', privatePage ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1');
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', `https://gonidoncloud.com${route === '/' ? '/' : route}`);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', `https://gonidoncloud.com${route === '/' ? '/' : route}`);
  }, [route]);

  useEffect(() => {
    const elements = document.querySelectorAll('.section-heading, .detail-section-heading, .experience-section-title, .product-card, .solution-panel, .news-card, .detail-features article, .product-workloads article, .experience-workload-grid article, .experience-bento__grid article, .contact-emails__grid > a, .driver-row, .platform-story__heading, .numbers-grid > div');
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    elements.forEach((element) => { element.classList.add('reveal'); observer.observe(element); });
    return () => observer.disconnect();
  }, [route]);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const elements = document.querySelectorAll('.product-card, .news-card, .experience-bento__grid article, .contact-emails__grid > a, .driver-row, .account-panel, .account-order');
    const cleanups = [...elements].map((element) => {
      element.classList.add('three-d-card');
      let frame;
      const move = (event) => {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          element.style.setProperty('--rotate-x', `${-y * 7}deg`);
          element.style.setProperty('--rotate-y', `${x * 9}deg`);
          element.style.setProperty('--light-x', `${(x + .5) * 100}%`);
          element.style.setProperty('--light-y', `${(y + .5) * 100}%`);
        });
      };
      const leave = () => {
        cancelAnimationFrame(frame);
        element.style.setProperty('--rotate-x', '0deg');
        element.style.setProperty('--rotate-y', '0deg');
      };
      element.addEventListener('pointermove', move);
      element.addEventListener('pointerleave', leave);
      return () => { cancelAnimationFrame(frame); element.removeEventListener('pointermove', move); element.removeEventListener('pointerleave', leave); element.classList.remove('three-d-card'); };
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [route]);

  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 800);
      const available = document.documentElement.scrollHeight - window.innerHeight;
      document.documentElement.style.setProperty('--scroll-progress', available > 0 ? window.scrollY / available : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handlePointer = (event) => {
      document.documentElement.style.setProperty('--pointer-x', `${event.clientX}px`);
      document.documentElement.style.setProperty('--pointer-y', `${event.clientY}px`);
    };
    window.addEventListener('pointermove', handlePointer, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointer);
  }, []);

  useEffect(() => {
    const overlay = searchOpen || contactOpen || architectureOpen || activeArticle || cookieSettingsOpen;
    document.body.style.overflow = overlay ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [searchOpen, contactOpen, architectureOpen, activeArticle, cookieSettingsOpen]);

  const solutionContent = {
    AI: { icon: BrainCircuit, title: 'AI without boundaries.', text: 'From training foundation models to real-time inference, build on an open compute platform that scales with your ideas.', stat: '3.2×', statText: 'more AI throughput per rack', link: 'Explore AI infrastructure' },
    Cloud: { icon: Cloud, title: 'Cloud, optimized.', text: 'Deliver more services with less infrastructure. FPU Apollon 1100 processors combine exceptional density with performance per watt.', stat: '42%', statText: 'lower infrastructure footprint', link: 'Explore cloud solutions' },
    HPC: { icon: Zap, title: 'Discovery, accelerated.', text: 'Solve larger, more complex problems with high core counts, massive memory bandwidth, and open HPC software.', stat: '2.7×', statText: 'faster time to results', link: 'Explore HPC solutions' },
    Data: { icon: Database, title: 'Data into decisions.', text: 'Keep analytics pipelines moving with balanced compute, memory, and I/O designed for data-intensive workloads.', stat: '68%', statText: 'faster analytical queries', link: 'Explore data solutions' },
  };
  const currentSolution = solutionContent[solution];
  const SolutionIcon = currentSolution.icon;

  return (
    <div id="top">
      <Suspense fallback={null}><ThreeBackground /></Suspense>
      <div className="site-progress" aria-hidden="true" />
      <div className="ambient-light" aria-hidden="true" />
      <Header onSearch={() => setSearchOpen(true)} onContact={() => setContactOpen(true)} theme={theme} onToggleTheme={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} user={user} />
      {route === '/' ? <main className="home-page">
        <section className="hero" id="fpu1100">
          <div className="hero__grid" />
          <div className="container hero__inner">
            <div className="hero__content">
              <div className="hero__eyebrow"><span /> OPEN COMPUTE / BUILT FOR WHAT'S NEXT</div>
              <h1>One open platform for every <br />compute workload<span>.</span></h1>
              <p>Processors, AI accelerators, and complete systems. One coherent architecture everywhere you build, from the workstation to the data center.</p>
              <div className="hero__buttons"><a className="button button--red" href="#/products/fpu-apollon-1100">Explore the platform <ArrowRight size={18} /></a><button className="button button--ghost" onClick={() => setArchitectureOpen(true)}>View architecture <ArrowUpRight size={17} /></button></div>
              <div className="hero__availability"><span className="status-dot" /> Pre-orders open now · first shipments Q1 2027</div>
            </div>
            <ComputeConsole />
          </div>
          <div className="container hero__specs">
            <div><strong>???</strong><span>High-performance cores</span></div><div><strong>???</strong><span>DDR5 memory channels</span></div><div><strong>???</strong><span>PCIe® 5.0 lanes</span></div><div className="hero__specs-note"><Cpu size={27} strokeWidth={1.4} /><span>One platform.<br />Infinite possibilities.</span></div>
          </div>
        </section>

        <section className="manifesto-section"><div className="container manifesto-section__inner"><span className="eyebrow">THE NEXT ERA IS BUILT, NOT WAITED FOR</span><h2>The future belongs to those<br />who give it <em>more compute.</em></h2><div className="manifesto-section__bottom"><p>Behind every breakthrough is an infrastructure decision. Make yours with a platform engineered for ambitious AI, transformative research, and cloud at extraordinary scale.</p><a className="text-link text-link--light" href="#/products/fpu-apollon-1100">See what becomes possible <ArrowRight size={18} /></a></div></div></section>

        <section className="platform-story"><div className="container"><div className="platform-story__heading"><span className="eyebrow">ONE VISION. EVERY LAYER.</span><h2>Extraordinary outcomes<br />don’t happen by accident.</h2><p>They happen when silicon, systems, and software are designed to move in the same direction.</p></div><div className="platform-story__scenes"><a href="#/products/fpu-apollon-1100"><span className="platform-story__number">01</span><div className="platform-story__icon"><Cpu size={40} strokeWidth={1} /></div><div><span>SILICON</span><h3>Performance without compromise.</h3><p>High-density compute, abundant memory bandwidth, and expansive I/O come together to turn demanding workloads into everyday possibilities.</p></div><ArrowUpRight size={25} /></a><a href="#/systems/flowsystem-r-1100"><span className="platform-story__number">02</span><div className="platform-story__icon"><Server size={40} strokeWidth={1} /></div><div><span>SYSTEMS</span><h3>Scale without the friction.</h3><p>From a single accelerated node to an integrated rack, build on validated infrastructure that lets your team focus on outcomes—not assembly.</p></div><ArrowUpRight size={25} /></a><a href="#/resources/developer-hub"><span className="platform-story__number">03</span><div className="platform-story__icon"><Layers3 size={40} strokeWidth={1} /></div><div><span>SOFTWARE</span><h3>Freedom to build what’s next.</h3><p>An open software approach gives your teams room to integrate, optimize, and evolve without putting unnecessary walls around your roadmap.</p></div><ArrowUpRight size={25} /></a></div></div></section>

        <section className="product-section section" id="products">
          <div className="container">
            <div className="section-heading"><div><span className="eyebrow">OUR TECHNOLOGY</span><h2>Performance, at every scale.</h2></div><p>From silicon to systems, everything we build is designed to move your business forward.</p></div>
            <div className="product-grid">
              {products.map((product) => (
                <article className="product-card" key={product.title}>
                  <div className="product-card__art"><span className="product-card__tag">{product.tag}</span><ProductArt type={product.type} /></div>
                  <div className="product-card__body"><span className="eyebrow">{product.eyebrow}</span><h3>{product.title}</h3><p>{product.text}</p><a className="text-link" href={`#${product.target}`}>{product.link}<ArrowRight size={17} /></a></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="summit-section" id="summit">
          <div className="container summit-section__inner">
            <div className="summit-section__visual"><RackVisual /></div>
            <div className="summit-section__content"><span className="eyebrow eyebrow--red">GONIDONCLOUD SUMMIT™</span><h2>Your entire data center.<br />Reimagined.</h2><p>Break through the limits of traditional infrastructure. FlowSystem R rack-scale systems unite compute, acceleration, networking, and cooling in one intelligent platform.</p><ul><li><Check size={18} />Pre-validated, rack-scale deployment</li><li><Check size={18} />Direct liquid cooling ready</li><li><Check size={18} />Open, modular architecture</li></ul><button className="button button--light" onClick={() => setContactOpen(true)}>Build your FlowSystem R system <ArrowRight size={18} /></button></div>
          </div>
        </section>

        <section className="solutions-section section" id="solutions">
          <div className="container">
            <div className="section-heading section-heading--center"><div><span className="eyebrow">BUILT FOR YOUR AMBITION</span><h2>One platform. Every possibility.</h2></div><p>Power the workloads that matter most—with performance you can measure and efficiency you can see.</p></div>
            <div className="solution-tabs" role="tablist" aria-label="Solutions by workload">
              {Object.keys(solutionContent).map((key) => <button role="tab" aria-selected={solution === key} className={solution === key ? 'active' : ''} onClick={() => setSolution(key)} key={key}>{key === 'AI' ? 'Artificial Intelligence' : key === 'HPC' ? 'HPC & Research' : key === 'Data' ? 'Data Analytics' : 'Cloud Computing'}</button>)}
            </div>
            <div className="solution-panel" role="tabpanel" key={solution}>
              <div className={`solution-panel__visual solution-panel__visual--${solution.toLowerCase()}`}><div className="solution-orbit solution-orbit--one" /><div className="solution-orbit solution-orbit--two" /><SolutionIcon size={94} strokeWidth={.75} /><div className="solution-panel__nodes">{Array.from({ length: 6 }, (_, i) => <span key={i} />)}</div><span className="solution-panel__visual-label">{solution} / OPTIMIZED</span></div>
              <div className="solution-panel__content"><span className="eyebrow">{solution === 'AI' ? 'ARTIFICIAL INTELLIGENCE' : solution === 'HPC' ? 'HIGH-PERFORMANCE COMPUTING' : solution === 'Data' ? 'DATA ANALYTICS' : 'CLOUD COMPUTING'}</span><h3>{currentSolution.title}</h3><p>{currentSolution.text}</p><div className="solution-stat"><strong>???</strong><span>{currentSolution.statText}<sup>1</sup></span></div><a className="text-link" href={`#${{ AI: '/solutions/ai', Cloud: '/solutions/cloud', HPC: '/solutions/hpc', Data: '/solutions/data-analytics' }[solution]}`}>{currentSolution.link}<ArrowRight size={17} /></a></div>
            </div>
            <p className="benchmark-note">1. Projected performance based on GonidonCloud internal testing. Results vary by configuration and workload.</p>
          </div>
        </section>

        <section className="numbers-section" id="company">
          <div className="container numbers-section__inner"><div className="numbers-section__intro"><span className="eyebrow">WHY GONIDONCLOUD</span><h2>Big ideas need<br />better foundations.</h2><p>We are engineers, optimists, and relentless problem-solvers building a more open future for compute.</p><a className="text-link text-link--light" href="#/company/about">Meet GonidonCloud <ArrowRight size={17} /></a></div><div className="numbers-grid"><div><strong>30%</strong><span>target reduction in data center energy use<sup>2</sup></span></div><div><strong>100%</strong><span>open software approach</span></div><div><strong>24/7</strong><span>global engineering support</span></div><div><Leaf size={40} strokeWidth={1.25} /><span>Designed for a more sustainable future</span></div></div></div>
          <div className="container numbers-section__foot">2. Based on a comparison of projected FPU Apollon 1100 rack performance against our previous-generation platform.</div>
        </section>

        <section className="resources-section section" id="resources">
          <div className="container resources-section__inner"><div className="resources-section__content"><span className="eyebrow eyebrow--red">OPEN BY DESIGN</span><h2>The tools to build<br />what’s next.</h2><p>Move from idea to deployment faster with production-ready software, detailed documentation, and a community that has your back.</p><div className="resource-links"><a href="#/resources/developer-hub"><span><Layers3 size={22} />Developer Hub<small>Software, tools, and open-source projects</small></span><ArrowUpRight size={19} /></a><a href="https://gonidoncloud.github.io/fpu-documentation/" target="_blank" rel="noreferrer"><span><Server size={22} />Documentation<small>Guides, specifications, and best practices</small></span><ArrowUpRight size={19} /></a><a href="#/support"><span><MessageSquare size={22} />Expert Support<small>Connect with a GonidonCloud engineer</small></span><ArrowUpRight size={19} /></a></div></div><div className="code-window"><div className="code-window__bar"><span /><span /><span /><small>fpu1100-quickstart.py</small></div><pre><code><span className="code-purple">from</span> gonidoncloud <span className="code-purple">import</span> fpu1100{`\n\n`}<span className="code-gray"># One platform. Every possibility.</span>{`\n`}platform = fpu1100.<span className="code-blue">connect</span>(){`\n`}cluster = platform.<span className="code-blue">create_cluster</span>({`\n`}  name=<span className="code-green">"what's-next"</span>,{`\n`}  nodes=<span className="code-orange">64</span>,{`\n`}  accelerator=<span className="code-green">"fpu-1100"</span>{`\n`}){`\n\n`}cluster.<span className="code-blue">deploy</span>(){`\n`}<span className="code-gray"># Ready. Set. Build.</span></code></pre><div className="code-window__status"><span><i /> CLUSTER READY</span><small>64 / 64 NODES ONLINE</small></div></div></div>
        </section>

        <section className="news-section section" id="newsroom">
          <div className="container"><div className="news-section__heading"><div><span className="eyebrow">THE LATEST</span><h2>What’s happening at GonidonCloud.</h2></div><a className="text-link" href="#/company/newsroom">Visit the newsroom <ArrowRight size={17} /></a></div><div className="news-grid">{news.slice(0, 3).map((article) => <article className="news-card" key={article.title}><button className={`news-card__art news-card__art--${article.art}`} onClick={() => setActiveArticle(article)} aria-label={`Read: ${article.title}`}>{article.art === 'chip' && <Cpu size={80} strokeWidth={.7} />}{article.art === 'network' && <><Globe2 size={92} strokeWidth={.65} /><span className="network-dot network-dot--one" /><span className="network-dot network-dot--two" /></>}{article.art === 'building' && <><div className="building-shape" /><Leaf size={56} strokeWidth={.9} /></>}</button><div className="news-card__body"><div className="news-card__meta"><span>{article.type}</span><time>{article.date}</time></div><h3>{article.title}</h3><button className="text-link" onClick={() => setActiveArticle(article)}>Read the story <ArrowUpRight size={16} /></button></div></article>)}</div></div>
        </section>

        <section className="cta-section" id="contact"><div className="cta-section__grid" /><div className="container cta-section__inner"><div><span className="eyebrow">YOUR NEXT STARTS HERE</span><h2>Let’s build what’s next.</h2></div><div><p>Bring us your hardest problem. We’ll bring the compute to solve it.</p><button className="button button--light" onClick={() => setContactOpen(true)}>Talk to an engineer <ArrowRight size={18} /></button></div></div></section>
      </main> : route === '/support/downloads' ? <DriversPage /> : route === '/store' ? <StorePage /> : route === '/login' ? <LoginPage /> : route === '/account' ? (user ? <AccountPage user={user} onUserChange={setUser} /> : <LoginPage />) : route.startsWith('/checkout/') ? <CheckoutPage productId={route.slice('/checkout/'.length)} user={user} /> : route.startsWith('/order/success/') ? <OrderResultPage orderId={route.slice('/order/success/'.length)} /> : route.startsWith('/order/cancelled/') ? <OrderResultPage orderId={route.slice('/order/cancelled/'.length)} cancelled /> : route === '/legal' || legalDocuments[route] ? <LegalPage route={route} onCookieSettings={() => setCookieSettingsOpen(true)} /> : <DetailPage page={getPage(route)} onContact={() => setContactOpen(true)} news={news} onArticle={setActiveArticle} />}

      <footer className="site-footer">
        <div className="container footer__top"><div className="footer__brand"><Brand light /><p>High-performance computing.<br />Human-sized possibilities.</p><address className="footer__address">Harbin, China<br />Street: ???</address><div className="footer__social"><a href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={19} /></a><a href="https://www.youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube"><Youtube size={20} /></a><a href="https://github.com/gonidoncloud" target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={19} /></a><a href="https://t.me/gonidoncloud" target="_blank" rel="noreferrer" aria-label="Telegram"><Send size={19} /></a><a href="https://discord.gg/gonidoncloud" target="_blank" rel="noreferrer" aria-label="Discord"><MessageSquare size={19} /></a></div></div><div className="footer__links"><div><h3>Products</h3><a href="#/products/fpu-apollon-1100">FPU Apollon 1100 Processors</a><a href="#/products/fpu-1100">FPU 1100 AI</a><a href="#/systems/flowsystem-r-1100">FlowSystem R Systems</a><a href="#/resources/developer-hub">Software</a></div><div><h3>Solutions</h3><a href="#/solutions/ai">Artificial Intelligence</a><a href="#/solutions/cloud">Cloud Computing</a><a href="#/solutions/hpc">HPC & Research</a><a href="#/solutions/data-analytics">Data Analytics</a></div><div><h3>Company</h3><a href="#/company/about">About Us</a><a href="#/company/newsroom">Newsroom</a><a href="#/company/careers">Careers</a><button onClick={() => setContactOpen(true)}>Contact</button></div><div><h3>Support</h3><a href="#/support">Support Center</a><a href="https://gonidoncloud.github.io/fpu-documentation/" target="_blank" rel="noreferrer">Documentation</a><a href="#/partners">Partner Network</a><a href="#/support/warranty">Warranty</a></div></div></div>
        <div className="container footer__legal"><span>LEGAL & COMPLIANCE</span><a href="#/legal/terms">Terms of Use</a><a href="#/legal/trademarks">Trademarks</a><a href="#/legal/supply-chain">Supply Chain</a><a href="#/legal/competition">Fair Competition</a><a href="#/legal/terms-of-sale">Terms of Sale</a><a href="#/legal/trade-compliance">Trade Compliance</a><a href="#/legal">All policies <ArrowUpRight size={12} /></a></div>
        <div className="container footer__bottom"><span>© 2026 GonidonCloud, Inc. All rights reserved.</span><div><a href="#/legal/privacy">Privacy</a><a href="#/legal/terms">Terms of Use</a><button onClick={() => setCookieSettingsOpen(true)}>Cookie Settings</button><a href="#/legal/privacy-choices">Privacy Choices</a><a href="#/legal/accessibility">Accessibility</a></div><span className="footer__locale"><Globe2 size={15} /> Global / English</span></div>
      </footer>

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} onContact={() => setContactOpen(true)} />}
      {contactOpen && <ContactModal onClose={() => setContactOpen(false)} />}
      {architectureOpen && <ArchitectureModal onClose={() => setArchitectureOpen(false)} />}
      {activeArticle && <Modal onClose={() => setActiveArticle(null)} label={activeArticle.title} className="article-modal"><div className={`article-modal__art news-card__art--${activeArticle.art}`}><Brand light /></div><div className="article-modal__body"><div className="news-card__meta"><span>{activeArticle.type}</span><time>{activeArticle.date}</time></div><h2>{activeArticle.title}</h2><p>{activeArticle.text}</p><p>At GonidonCloud, we believe the next generation of computing should be more powerful, more open, and more efficient. This milestone reflects the work of our engineering teams and partners around the world.</p><p>Learn how our latest technologies can help your organization move from ambitious ideas to real-world impact.</p><button className="button button--red" onClick={() => { setActiveArticle(null); setContactOpen(true); }}>Talk to our team <ArrowRight size={17} /></button></div></Modal>}
      <CookieManager settingsOpen={cookieSettingsOpen} onOpenSettings={() => setCookieSettingsOpen(true)} onCloseSettings={() => setCookieSettingsOpen(false)} />
      {showTop && <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top"><ArrowUp size={19} /></button>}
    </div>
  );
}

export default App;
