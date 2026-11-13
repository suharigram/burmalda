import { ArrowRight, ArrowUpRight, ChevronRight, Printer, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { legalDocuments, legalIndex } from './legalData.js';

export default function LegalPage({ route, onCookieSettings }) {
  const document = legalDocuments[route];
  const isIndex = route === '/legal';
  if (!document && !isIndex) return null;

  return (
    <main className="legal-page">
      <section className="legal-hero"><div className="container"><nav className="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><ChevronRight size={13} /><a href="/legal">Legal & Compliance</a>{document && <><ChevronRight size={13} /><span>{document.title}</span></>}</nav><div className="legal-hero__content"><div><span className="eyebrow eyebrow--red">MINDPICK / LEGAL & COMPLIANCE</span><h1>{isIndex ? 'Legal & Compliance' : document.title}</h1><p>{isIndex ? 'Clear terms, responsible business practices, and straightforward choices. Find our website, purchasing, privacy, product, and partner policies in one place.' : document.description}</p></div><ShieldCheck size={76} strokeWidth={.8} /></div></div></section>

      {isIndex ? (
        <section className="section legal-index"><div className="container"><div className="legal-index__groups">{legalIndex.map((group) => <div className="legal-group" key={group.title}><h2>{group.title}</h2><div>{group.items.map((item) => <a href={`${item.to}`} key={item.to}><span><h3>{item.title}</h3><p>{item.text}</p></span><ArrowUpRight size={19} /></a>)}</div></div>)}</div><div className="legal-index__settings"><div><SlidersHorizontal size={26} /><span><h3>Your preferences, your choice.</h3><p>Review or change optional cookies at any time.</p></span></div><button className="button button--dark" onClick={onCookieSettings}>Open Cookie Settings <ArrowRight size={16} /></button></div></div></section>
      ) : (
        <div className="container legal-layout">
          <aside className="legal-sidebar"><span>LEGAL & COMPLIANCE</span>{legalIndex.flatMap((group) => group.items).map((item) => <a className={item.to === route ? 'active' : ''} href={`${item.to}`} key={item.to}>{item.title}</a>)}<a className="legal-sidebar__all" href="/legal">View all policies <ArrowRight size={14} /></a></aside>
          <article className="legal-document"><div className="legal-document__meta"><span>Last updated: {document.updated}</span><button onClick={() => window.print()}><Printer size={15} /> Print policy</button></div><p className="legal-document__intro">{document.description}</p>{document.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.list && <ul>{section.list.map((item) => <li key={item}>{item}</li>)}</ul>}{section.links?.map((link) => <a className="text-link" href={`${link.to}`} key={link.to}>{link.label}<ArrowRight size={15} /></a>)}</section>)}{(route === '/legal/cookies' || route === '/legal/privacy-choices') && <button className="button button--red legal-cookie-button" onClick={onCookieSettings}>Manage cookie preferences <SlidersHorizontal size={16} /></button>}<div className="legal-document__contact"><h3>Questions about this policy?</h3><p>Contact the Mindpick legal team at <a href="mailto:legal@mindpick.com">legal@mindpick.com</a>.</p></div></article>
        </div>
      )}
    </main>
  );
}
