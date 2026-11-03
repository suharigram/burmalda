import { useEffect, useState } from 'react';
import { Apple, ArrowRight, Box, Check, ChevronRight, CircleUserRound, Download, Github, Globe2, LogOut, Package, PackageCheck, Settings, ShoppingBag, Truck } from 'lucide-react';
import { formatPrice } from './commerceData.js';

const providerDetails = {
  google: { label: 'Google', icon: Globe2 },
  apple: { label: 'Apple', icon: Apple },
  github: { label: 'GitHub', icon: Github },
};
const statusLabels = { pending_payment: 'Awaiting payment', checkout_created: 'Checkout started', checkout_failed: 'Payment incomplete', paid: 'Order confirmed', awaiting_invoice: 'Invoice pending', processing: 'Preparing your order', shipped: 'Shipped', delivered: 'Delivered' };

export function LoginPage() {
  const [providers, setProviders] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const error = new URLSearchParams(window.location.hash.split('?')[1] || '').get('error');
  useEffect(() => { fetch('/api/auth/providers').then((response) => response.json()).then((data) => setProviders(data.providers || [])).catch(() => {}).finally(() => setLoaded(true)); }, []);
  return <main className="login-page"><section className="login-card"><span className="eyebrow eyebrow--red">GONIDONCLOUD ACCOUNT</span><h1>Welcome back.</h1><p>Sign in to manage your infrastructure orders, downloads, and profile.</p><div className="login-providers">{Object.entries(providerDetails).map(([id, provider]) => { const Icon = provider.icon; const enabled = providers.includes(id); return <a key={id} className={`login-provider ${!enabled ? 'login-provider--disabled' : ''}`} href={enabled ? `/api/auth/${id}` : undefined} aria-disabled={!enabled}><Icon size={21} /><span>Continue with {provider.label}</span><ArrowRight size={17} /></a>; })}</div>{loaded && !providers.length && <div className="login-setup">Sign-in providers are not configured yet. Add the OAuth credentials to the server environment to enable Google, Apple, and GitHub.</div>}{error && <div className="form-error" role="alert">We could not complete sign-in. Please try again or use another provider.</div>}<small>By continuing, you agree to our <a href="#/legal/terms">Terms of Use</a> and <a href="#/legal/privacy">Privacy Policy</a>.</small></section></main>;
}

function Tracking({ order }) {
  const shipped = ['shipped', 'delivered'].includes(order.status);
  const delivered = order.status === 'delivered';
  return <div className="order-tracking"><div className="tracking-step complete"><span><Check size={14} /></span><div><strong>Order placed</strong><small>{new Date(order.createdAt).toLocaleDateString()}</small></div></div><div className={`tracking-line ${shipped ? 'complete' : ''}`} /><div className={`tracking-step ${shipped ? 'complete' : ''}`}><span>{shipped ? <Check size={14} /> : <Truck size={15} />}</span><div><strong>{shipped ? 'Shipped' : 'Preparing for shipment'}</strong><small>{order.trackingNumber || 'Tracking details will appear here'}</small></div></div><div className={`tracking-line ${delivered ? 'complete' : ''}`} /><div className={`tracking-step ${delivered ? 'complete' : ''}`}><span>{delivered ? <Check size={14} /> : <PackageCheck size={15} />}</span><div><strong>Delivered</strong><small>{delivered ? 'Shipment complete' : 'Expected Q1 2027'}</small></div></div></div>;
}

export function AccountPage({ user, onUserChange }) {
  const [tab, setTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [profile, setProfile] = useState(user);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([fetch('/api/account/orders').then((response) => response.json()), fetch('/api/account/downloads').then((response) => response.json())]).then(([orderData, downloadData]) => { setOrders(orderData.orders || []); setDownloads(downloadData.downloads || []); }).catch(() => setMessage('Some account information is temporarily unavailable.')).finally(() => setLoading(false));
  }, []);
  const logout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); onUserChange(null); window.location.hash = '/'; };
  const saveProfile = async (event) => {
    event.preventDefault(); setMessage('Saving…');
    const response = await fetch('/api/account/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) });
    const result = await response.json();
    if (response.ok) { setProfile(result.user); onUserChange(result.user); setMessage('Profile updated.'); } else setMessage(result.message || 'Unable to save your profile.');
  };
  const initials = user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const tabs = [{ id: 'overview', label: 'Overview', icon: CircleUserRound }, { id: 'orders', label: 'Orders & tracking', icon: Package }, { id: 'downloads', label: 'Drivers & software', icon: Download }, { id: 'settings', label: 'Profile settings', icon: Settings }];
  return <main className="account-page"><div className="container account-heading"><div className="account-avatar">{user.avatar ? <img src={user.avatar} alt="" /> : initials}</div><div><span className="eyebrow eyebrow--red">MY GONIDONCLOUD</span><h1>Hello, {user.name.split(' ')[0]}.</h1><p>{user.email}</p></div><button className="account-logout" onClick={logout}><LogOut size={17} /> Sign out</button></div><div className="container account-layout"><aside className="account-nav">{tabs.map((item) => { const Icon = item.icon; return <button key={item.id} className={tab === item.id ? 'active' : ''} onClick={() => { setTab(item.id); setMessage(''); }}><Icon size={19} />{item.label}<ChevronRight size={16} /></button>; })}</aside><section className="account-content">
    {tab === 'overview' && <><div className="account-section-title"><span className="eyebrow">ACCOUNT OVERVIEW</span><h2>Everything in one place.</h2></div><div className="account-stats"><button onClick={() => setTab('orders')}><ShoppingBag size={24} /><strong>{orders.length}</strong><span>Total orders</span></button><button onClick={() => setTab('orders')}><Truck size={24} /><strong>{orders.filter((order) => order.status === 'shipped').length}</strong><span>In transit</span></button><button onClick={() => setTab('downloads')}><Download size={24} /><strong>{downloads.length}</strong><span>Available software</span></button></div><div className="account-panel"><div className="account-panel__heading"><h3>Recent orders</h3><button onClick={() => setTab('orders')}>View all <ArrowRight size={15} /></button></div>{orders.length ? orders.slice(0, 2).map((order) => <OrderCard key={order.orderId} order={order} />) : <EmptyOrders />}</div></>}
    {tab === 'orders' && <><div className="account-section-title"><span className="eyebrow">PURCHASES</span><h2>Orders & tracking.</h2><p>Follow your order from confirmation to delivery.</p></div>{orders.length ? orders.map((order) => <OrderCard key={order.orderId} order={order} detailed />) : <EmptyOrders />}</>}
    {tab === 'downloads' && <><div className="account-section-title"><span className="eyebrow">SOFTWARE CENTER</span><h2>Drivers & software.</h2><p>Official releases for your GonidonCloud infrastructure.</p></div><div className="download-list">{downloads.map((item) => <article className="download-card" key={item.id}><span className="download-card__icon"><Download size={24} /></span><div><h3>{item.name}</h3><p>{item.platform}</p><span>Version {item.version} · {item.size}</span></div>{item.url ? <a className="button button--dark" href={item.url} download>Download <Download size={16} /></a> : <span className="download-unavailable">Package not published</span>}</article>)}</div><p className="download-note">Download links become available when signed release packages are published. Release notes and installation guidance are available in <a href="https://gonidoncloud.github.io/fpu-documentation/" target="_blank" rel="noreferrer">Documentation</a>.</p></>}
    {tab === 'settings' && <><div className="account-section-title"><span className="eyebrow">PERSONALIZATION</span><h2>Your profile.</h2><p>Keep your contact and organization details up to date.</p></div><form className="profile-form" onSubmit={saveProfile}><div className="profile-form__avatar"><div className="account-avatar">{user.avatar ? <img src={user.avatar} alt="" /> : initials}</div><div><strong>{user.name}</strong><span>Profile photo is managed by {providerDetails[user.provider]?.label || 'your sign-in provider'}.</span></div></div><div className="profile-form__grid"><label>Full name<input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} required maxLength={120} /></label><label>Email address<input value={user.email} disabled /></label><label>Company<input value={profile.company} onChange={(event) => setProfile({ ...profile, company: event.target.value })} maxLength={160} placeholder="Your organization" /></label><label>Phone<input type="tel" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} maxLength={40} placeholder="+1 555 000 0000" /></label><label>Location<input value={profile.location} onChange={(event) => setProfile({ ...profile, location: event.target.value })} maxLength={120} placeholder="City, country" /></label></div><button className="button button--red" type="submit">Save changes <ArrowRight size={16} /></button>{message && <p className="profile-message" role="status">{message}</p>}</form></>}
    {loading && tab === 'overview' && <p className="account-loading">Loading account activity…</p>}{message && tab !== 'settings' && <p className="profile-message" role="status">{message}</p>}
  </section></div></main>;
}

function EmptyOrders() { return <div className="account-empty"><Box size={34} /><h3>No orders yet.</h3><p>Your pre-orders and delivery updates will appear here.</p><a className="button button--red" href="#/store">Explore the store <ArrowRight size={16} /></a></div>; }
function OrderCard({ order, detailed = false }) { return <article className="account-order"><div className="account-order__top"><div><span>{order.reference}</span><h3>{order.productName}</h3></div><span className={`order-status order-status--${order.status}`}>{statusLabels[order.status] || order.status}</span></div><div className="account-order__meta"><span>Qty. {order.quantity}</span><strong>{formatPrice(order.total, order.currency)}</strong><time>{new Date(order.createdAt).toLocaleDateString()}</time></div>{detailed && <Tracking order={order} />}</article>; }
