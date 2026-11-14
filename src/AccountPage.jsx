import { useEffect, useState } from 'react';
import { ArrowRight, Box, Check, ChevronRight, CircleUserRound, Download, Github, Globe2, LogOut, Package, PackageCheck, Settings, ShoppingBag, Truck } from 'lucide-react';
import { formatPrice } from './commerceData.js';

const providerDetails = {
  google: { label: 'Google', icon: Globe2 },
  github: { label: 'GitHub', icon: Github },
};
const statusLabels = { pending_payment: 'Awaiting payment', checkout_created: 'Checkout started', checkout_failed: 'Payment incomplete', paid: 'Order confirmed', awaiting_invoice: 'Invoice pending', processing: 'Preparing your order', shipped: 'Shipped', delivered: 'Delivered' };

export function LoginPage() {
  const [providers, setProviders] = useState([]);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setError(params.get('error') || '');
    if (params.get('recovery') === '1') setMode('recovery');
    fetch('/api/auth/providers').then((response) => response.json()).then((data) => {
      setProviders(data.providers || []);
      setEmailEnabled(data.email === true);
    }).catch(() => {}).finally(() => setLoaded(true));
  }, []);

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    setMessage('');
    setPassword('');
    setPasswordConfirm('');
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if ((mode === 'signup' || mode === 'recovery') && password !== passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }
    setPending(true);
    try {
      const endpoint = mode === 'forgot' ? '/api/auth/recovery' : mode === 'recovery' ? '/api/auth/password' : '/api/auth/email';
      const payload = mode === 'forgot' ? { email } : mode === 'recovery' ? { password } : { action: mode, name, email, password };
      const response = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message || 'Unable to complete the request.');
      } else if (result.user) {
        window.location.assign('/account');
      } else {
        setMessage(result.message || 'Check your inbox.');
        setPassword('');
        setPasswordConfirm('');
      }
    } catch {
      setError('The authentication service is temporarily unavailable. Please try again.');
    } finally {
      setPending(false);
    }
  };

  const heading = mode === 'signup' ? 'Create your account.' : mode === 'forgot' ? 'Reset your password.' : mode === 'recovery' ? 'Choose a new password.' : 'Welcome back.';
  const description = mode === 'signup' ? 'Create a Clod Le Grade account to manage orders, downloads, and your profile.'
    : mode === 'forgot' ? 'Enter your account email and we will send you a secure reset link.'
      : mode === 'recovery' ? 'Use at least 8 characters for your new password.'
        : 'Sign in to manage your infrastructure orders, downloads, and profile.';

  return (
    <main className="login-page">
      <section className="login-card">
        <span className="eyebrow eyebrow--red">CLOD LE GRADE ACCOUNT</span>
        <h1>{heading}</h1>
        <p>{description}</p>
        {(mode === 'signin' || mode === 'signup') && <div className="login-tabs" role="tablist" aria-label="Account access">
          <button type="button" role="tab" aria-selected={mode === 'signin'} className={mode === 'signin' ? 'active' : ''} onClick={() => changeMode('signin')}>Sign in</button>
          <button type="button" role="tab" aria-selected={mode === 'signup'} className={mode === 'signup' ? 'active' : ''} onClick={() => changeMode('signup')}>Create account</button>
        </div>}
        <form className="login-form" onSubmit={submit}>
          <fieldset disabled={!emailEnabled || pending}>
            {mode === 'signup' && <label>Full name<input type="text" value={name} onChange={(event) => setName(event.target.value)} required maxLength={120} autoComplete="name" placeholder="Your name" /></label>}
            {mode !== 'recovery' && <label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={254} autoComplete="email" placeholder="you@company.com" /></label>}
            {mode !== 'forgot' && <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} maxLength={72} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} placeholder="At least 8 characters" /></label>}
            {(mode === 'signup' || mode === 'recovery') && <label>Confirm password<input type="password" value={passwordConfirm} onChange={(event) => setPasswordConfirm(event.target.value)} required minLength={8} maxLength={72} autoComplete="new-password" placeholder="Repeat your password" /></label>}
            <button className="button button--red login-submit" type="submit">{pending ? 'Please wait…' : mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Send reset link' : mode === 'recovery' ? 'Update password' : 'Sign in'}<ArrowRight size={17} /></button>
          </fieldset>
        </form>
        {mode === 'signin' && <button type="button" className="login-forgot" onClick={() => changeMode('forgot')}>Forgot password?</button>}
        {(mode === 'forgot' || mode === 'recovery') && <button type="button" className="login-forgot" onClick={() => changeMode('signin')}>Back to sign in</button>}
        {(mode === 'signin' || mode === 'signup') && <>
          <div className="login-divider"><span>or continue with</span></div>
          <div className="login-providers">{Object.entries(providerDetails).map(([id, provider]) => {
            const Icon = provider.icon;
            const enabled = providers.includes(id);
            return <a key={id} className={`login-provider ${!enabled ? 'login-provider--disabled' : ''}`} href={enabled ? `/api/auth/${id}` : undefined} aria-disabled={!enabled}><Icon size={21} /><span>{provider.label}</span><ArrowRight size={17} /></a>;
          })}</div>
        </>}
        {loaded && !emailEnabled && <div className="login-setup">Connect Supabase to enable email, Google, and GitHub sign-in.</div>}
        {error && <div className="form-error login-message" role="alert">{error}</div>}
        {message && <div className="login-success login-message" role="status">{message}</div>}
        <small>By continuing, you agree to our <a href="/legal/terms">Terms of Use</a> and <a href="/legal/privacy">Privacy Policy</a>.</small>
      </section>
    </main>
  );
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
  const logout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); onUserChange(null); window.location.assign('/'); };
  const saveProfile = async (event) => {
    event.preventDefault(); setMessage('Saving…');
    const response = await fetch('/api/account/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) });
    const result = await response.json();
    if (response.ok) { setProfile(result.user); onUserChange(result.user); setMessage('Profile updated.'); } else setMessage(result.message || 'Unable to save your profile.');
  };
  const initials = user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const tabs = [{ id: 'overview', label: 'Overview', icon: CircleUserRound }, { id: 'orders', label: 'Orders & tracking', icon: Package }, { id: 'downloads', label: 'Drivers & software', icon: Download }, { id: 'settings', label: 'Profile settings', icon: Settings }];
  return <main className="account-page"><div className="container account-heading"><div className="account-avatar">{user.avatar ? <img src={user.avatar} alt="" /> : initials}</div><div><span className="eyebrow eyebrow--red">MY CLOD LE GRADE</span><h1>Hello, {user.name.split(' ')[0]}.</h1><p>{user.email}</p></div><button className="account-logout" onClick={logout}><LogOut size={17} /> Sign out</button></div><div className="container account-layout"><aside className="account-nav">{tabs.map((item) => { const Icon = item.icon; return <button key={item.id} className={tab === item.id ? 'active' : ''} onClick={() => { setTab(item.id); setMessage(''); }}><Icon size={19} />{item.label}<ChevronRight size={16} /></button>; })}</aside><section className="account-content">
    {tab === 'overview' && <><div className="account-section-title"><span className="eyebrow">ACCOUNT OVERVIEW</span><h2>Everything in one place.</h2></div><div className="account-stats"><button onClick={() => setTab('orders')}><ShoppingBag size={24} /><strong>{orders.length}</strong><span>Total orders</span></button><button onClick={() => setTab('orders')}><Truck size={24} /><strong>{orders.filter((order) => order.status === 'shipped').length}</strong><span>In transit</span></button><button onClick={() => setTab('downloads')}><Download size={24} /><strong>{downloads.length}</strong><span>Available software</span></button></div><div className="account-panel"><div className="account-panel__heading"><h3>Recent orders</h3><button onClick={() => setTab('orders')}>View all <ArrowRight size={15} /></button></div>{orders.length ? orders.slice(0, 2).map((order) => <OrderCard key={order.orderId} order={order} />) : <EmptyOrders />}</div></>}
    {tab === 'orders' && <><div className="account-section-title"><span className="eyebrow">PURCHASES</span><h2>Orders & tracking.</h2><p>Follow your order from confirmation to delivery.</p></div>{orders.length ? orders.map((order) => <OrderCard key={order.orderId} order={order} detailed />) : <EmptyOrders />}</>}
    {tab === 'downloads' && <><div className="account-section-title"><span className="eyebrow">SOFTWARE CENTER</span><h2>Drivers & software.</h2><p>Official releases for your Clod Le Grade infrastructure.</p></div><div className="download-list">{downloads.map((item) => <article className="download-card" key={item.id}><span className="download-card__icon"><Download size={24} /></span><div><h3>{item.name}</h3><p>{item.platform}</p><span>Version {item.version} · {item.size}</span></div>{item.url ? <a className="button button--dark" href={item.url} download>Download <Download size={16} /></a> : <span className="download-unavailable">Package not published</span>}</article>)}</div><p className="download-note">Download links become available when signed release packages are published. Release notes and installation guidance are available in <a href="https://clodlegrade.github.io/fpu-documentation/" target="_blank" rel="noreferrer">Documentation</a>.</p></>}
    {tab === 'settings' && <><div className="account-section-title"><span className="eyebrow">PERSONALIZATION</span><h2>Your profile.</h2><p>Keep your contact and organization details up to date.</p></div><form className="profile-form" onSubmit={saveProfile}><div className="profile-form__avatar"><div className="account-avatar">{user.avatar ? <img src={user.avatar} alt="" /> : initials}</div><div><strong>{user.name}</strong><span>Profile photo is managed by {providerDetails[user.provider]?.label || 'your sign-in provider'}.</span></div></div><div className="profile-form__grid"><label>Full name<input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} required maxLength={120} /></label><label>Email address<input value={user.email} disabled /></label><label>Company<input value={profile.company} onChange={(event) => setProfile({ ...profile, company: event.target.value })} maxLength={160} placeholder="Your organization" /></label><label>Phone<input type="tel" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} maxLength={40} placeholder="+1 555 000 0000" /></label><label>Location<input value={profile.location} onChange={(event) => setProfile({ ...profile, location: event.target.value })} maxLength={120} placeholder="City, country" /></label></div><button className="button button--red" type="submit">Save changes <ArrowRight size={16} /></button>{message && <p className="profile-message" role="status">{message}</p>}</form></>}
    {loading && tab === 'overview' && <p className="account-loading">Loading account activity…</p>}{message && tab !== 'settings' && <p className="profile-message" role="status">{message}</p>}
  </section></div></main>;
}

function EmptyOrders() { return <div className="account-empty"><Box size={34} /><h3>No orders yet.</h3><p>Your pre-orders and delivery updates will appear here.</p><a className="button button--red" href="/store">Explore the store <ArrowRight size={16} /></a></div>; }
function OrderCard({ order, detailed = false }) { return <article className="account-order"><div className="account-order__top"><div><span>{order.reference}</span><h3>{order.productName}</h3></div><span className={`order-status order-status--${order.status}`}>{statusLabels[order.status] || order.status}</span></div><div className="account-order__meta"><span>Qty. {order.quantity}</span><strong>{formatPrice(order.total, order.currency)}</strong><time>{new Date(order.createdAt).toLocaleDateString()}</time></div>{detailed && <Tracking order={order} />}</article>; }
