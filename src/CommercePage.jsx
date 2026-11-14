import { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, Check, CreditCard, FileText, LockKeyhole, PackageCheck, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import { ProductArt } from './Visuals.jsx';
import { catalog, formatPrice, getCatalogItem } from './commerceData.js';

const initialForm = { name: '', email: '', company: '', country: 'US', address: '', city: '', postalCode: '', purchaseOrder: '', paymentMethod: 'card', terms: false, trade: false, website: '' };

export function StorePage() {
  return (
    <main className="store-page">
      <section className="store-hero"><div className="container"><span className="eyebrow eyebrow--red">CLOD LE GRADE / STORE</span><h1>Infrastructure,<br />ready for tomorrow.</h1><p>Reserve our first wave of compute now. Transparent pricing, secure payment, and engineering support included for every pre-order.</p></div></section>
      <section className="section"><div className="container"><div className="store-assurances"><span><ShieldCheck size={19} /> Secure pre-order checkout</span><span><Truck size={19} /> Expected to ship Q1 2027</span><span><PackageCheck size={19} /> Allocation priority, first wave</span><span><FileText size={19} /> Card or pro forma invoice</span></div><div className="store-grid">{catalog.map((item) => <article className="store-card" key={item.id}><a className="store-card__art" href={`${item.route}`}><ProductArt type={item.visual} /></a><div className="store-card__body"><span className="eyebrow">CLOD LE GRADE</span><h2>{item.name}</h2><p>{item.description}</p><div className="store-card__price"><strong>{formatPrice(item.unitAmount, item.currency)}</strong><span>USD / unit</span></div><div className="store-card__delivery"><Truck size={15} />{item.leadTime}</div><a className="button button--red" href={`/checkout/${item.id}`}>Pre-order now <ArrowRight size={17} /></a></div></article>)}</div><p className="store-terms">Pre-orders reserve allocation in our first production wave. Card pre-orders are charged today to secure your place in the queue; invoice pre-orders follow the payment terms on the pro forma invoice. All orders are subject to our <a href="/legal/terms-of-sale">Terms of Sale</a> and trade-compliance review.</p></div></section>
    </main>
  );
}

export function CheckoutPage({ productId, user }) {
  const item = getCatalogItem(productId);
  const [quantity, setQuantity] = useState(1);
  const [form, setForm] = useState(initialForm);
  useEffect(() => {
    if (user) setForm((current) => ({ ...current, name: user.name, email: user.email, company: user.company || current.company }));
  }, [user]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  if (!item) return <main className="checkout-missing"><div className="container"><h1>Product not found.</h1><a className="button button--dark" href="/store">Back to the store</a></div></main>;

  const update = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };
  const submit = async (event) => {
    event.preventDefault();
    setStatus('submitting'); setError('');
    try {
      const response = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: item.id, quantity, customer: form }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Checkout could not be started.');
      if (result.checkoutUrl) { window.location.assign(result.checkoutUrl); return; }
      setInvoiceOrder(result); setStatus('success'); window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (requestError) {
      setError(requestError.message || 'The secure checkout is unavailable. Please try again or contact sales.');
      setStatus('error');
    }
  };

  if (invoiceOrder) return <main className="order-result"><div className="container order-result__card"><span className="order-result__icon"><FileText size={32} /></span><span className="eyebrow eyebrow--red">PRE-ORDER RECEIVED</span><h1>Your pro forma invoice is next.</h1><p>Pre-order <strong>{invoiceOrder.reference}</strong> has been recorded. Our sales team will verify configuration, tax, delivery, and trade compliance, then send payment instructions to <strong>{form.email}</strong> within one business day.</p><div className="order-result__note"><AlertCircle size={18} /><span>No payment has been taken. Please do not transfer funds until you receive the verified invoice.</span></div><a className="button button--dark" href="/store">Return to the store <ArrowRight size={16} /></a></div></main>;

  return (
    <main className="checkout-page"><div className="container checkout-page__top"><a href="/store"><ArrowLeft size={15} /> Back to store</a><span><LockKeyhole size={14} /> Secure pre-order checkout</span></div><div className="container checkout-layout"><form className="checkout-form" onSubmit={submit}><span className="eyebrow eyebrow--red">SECURE PRE-ORDER</span><h1>Pre-order checkout</h1><p>Pre-orders are reviewed before fulfillment begins in Q1 2027. Card details are entered only on Stripe’s secure hosted checkout.</p><fieldset><legend>1. Contact information</legend><div className="checkout-form__row"><label>Full name<input name="name" autoComplete="name" value={form.name} onChange={update} required maxLength="120" /></label><label>Work email<input name="email" type="email" autoComplete="email" value={form.email} onChange={update} required /></label></div><label>Company<input name="company" autoComplete="organization" value={form.company} onChange={update} required maxLength="160" /></label></fieldset><fieldset><legend>2. Delivery address</legend><label>Country / region<select name="country" value={form.country} onChange={update}>{[['US', 'United States'], ['CA', 'Canada'], ['GB', 'United Kingdom'], ['DE', 'Germany'], ['FR', 'France'], ['NL', 'Netherlands'], ['AE', 'United Arab Emirates'], ['SG', 'Singapore'], ['JP', 'Japan'], ['AU', 'Australia']].map(([code, name]) => <option value={code} key={code}>{name}</option>)}</select></label><label>Street address<input name="address" autoComplete="street-address" value={form.address} onChange={update} required maxLength="220" /></label><div className="checkout-form__row"><label>City<input name="city" autoComplete="address-level2" value={form.city} onChange={update} required maxLength="100" /></label><label>Postal code<input name="postalCode" autoComplete="postal-code" value={form.postalCode} onChange={update} required maxLength="24" /></label></div></fieldset><fieldset><legend>3. Payment method</legend><div className="payment-methods"><label className={form.paymentMethod === 'card' ? 'selected' : ''}><input type="radio" name="paymentMethod" value="card" checked={form.paymentMethod === 'card'} onChange={update} /><CreditCard size={25} /><span><strong>Card via Stripe</strong><small>Charged today to reserve your pre-order allocation. Ships Q1 2027.</small></span><i /></label><label className={form.paymentMethod === 'invoice' ? 'selected' : ''}><input type="radio" name="paymentMethod" value="invoice" checked={form.paymentMethod === 'invoice'} onChange={update} /><FileText size={25} /><span><strong>Pro forma invoice</strong><small>Bank transfer after verification. Best for business purchases and volume pre-orders.</small></span><i /></label></div>{form.paymentMethod === 'invoice' && <label>Purchase order number (optional)<input name="purchaseOrder" value={form.purchaseOrder} onChange={update} maxLength="80" /></label>}</fieldset><div className="checkout-consent"><label><input type="checkbox" name="terms" checked={form.terms} onChange={update} required /><span>I agree to the <a href="/legal/terms-of-sale" target="_blank">Terms of Sale</a> and acknowledge the <a href="/legal/privacy" target="_blank">Privacy Policy</a>.</span></label><label><input type="checkbox" name="trade" checked={form.trade} onChange={update} required /><span>I confirm this pre-order will not be used or transferred in violation of applicable export controls or sanctions.</span></label></div><label className="form-honeypot" aria-hidden="true">Website<input name="website" tabIndex="-1" autoComplete="off" value={form.website} onChange={update} /></label>{error && <div className="form-error" role="alert"><AlertCircle size={18} /><span>{error}{(status === 'error' && form.paymentMethod === 'card') && <> You can select <strong>Pro forma invoice</strong> instead.</>}</span></div>}<button className="button button--red checkout-submit" disabled={status === 'submitting'}>{status === 'submitting' ? 'Starting secure checkout…' : form.paymentMethod === 'card' ? `Reserve allocation · ${formatPrice(item.unitAmount * quantity)}` : 'Reserve via pro forma invoice'}<ArrowRight size={18} /></button><div className="checkout-security"><LockKeyhole size={14} /> TLS encrypted · No card data stored by Clod Le Grade</div></form><aside className="order-summary"><span className="eyebrow">YOUR ORDER</span><div className="order-summary__art"><ProductArt type={item.visual} /></div><h2>{item.name}</h2><p>{item.description}</p><label>Quantity<select value={quantity} onChange={(event) => setQuantity(Number(event.target.value))}>{Array.from({ length: item.maxQuantity }, (_, index) => index + 1).map((value) => <option key={value} value={value}>{value}</option>)}</select></label><div className="order-summary__lines"><div><span>Unit price</span><strong>{formatPrice(item.unitAmount)}</strong></div><div><span>Pre-order allocation</span><strong>Confirmed by email</strong></div><div><span>Taxes &amp; duties</span><strong>Calculated before payment</strong></div></div><div className="order-summary__total"><span>Hardware subtotal</span><strong>{formatPrice(item.unitAmount * quantity)}</strong></div><div className="order-summary__lead"><Truck size={16} />{item.leadTime}</div><a href={`${item.route}`}>View product details <ArrowRight size={14} /></a></aside></div></main>
  );
}

export function OrderResultPage({ orderId, cancelled = false }) {
  const [order, setOrder] = useState(null);
  useEffect(() => {
    if (!orderId || cancelled) return;
    fetch(`/api/orders/${encodeURIComponent(orderId)}`).then((response) => response.ok ? response.json() : null).then(setOrder).catch(() => {});
  }, [orderId, cancelled]);
  const paid = order?.status === 'paid';
  let eyebrow = 'PRE-ORDER RECEIVED';
  let title = 'We’re confirming your payment.';
  let message = <>Pre-order <strong>{order?.reference || orderId}</strong> has been created. Returning from Stripe does not confirm payment; your allocation will be reserved after our verified Stripe webhook confirms it.</>;
  if (cancelled) {
    eyebrow = 'CHECKOUT CANCELLED';
    title = 'Your pre-order is still here.';
    message = 'No payment was taken. You can return to checkout or ask our sales team for help.';
  } else if (paid) {
    eyebrow = 'PRE-ORDER RESERVED';
    title = 'Thank you for your pre-order.';
    message = <>Payment for pre-order <strong>{order.reference}</strong> is confirmed. Your allocation is reserved for the Q1 2027 production wave, and we’ll send shipping updates by email.</>;
  }
  return (
    <main className="order-result">
      <div className="container order-result__card">
        <span className="order-result__icon">{cancelled ? <ShoppingBag size={32} /> : <Check size={32} />}</span>
        <span className="eyebrow eyebrow--red">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{message}</p>
        {!cancelled && (
          <div className="order-result__note">
            {paid ? <Check size={18} /> : <AlertCircle size={18} />}
            <span>{paid ? 'Payment confirmed. Your pre-order is now in our allocation queue for Q1 2027.' : 'Payment confirmation can take a few moments. Refresh this page to check the latest status.'}</span>
          </div>
        )}
        <a className="button button--dark" href={cancelled ? '/store' : '/'}>{cancelled ? 'Return to checkout' : 'Back to Clod Le Grade'}<ArrowRight size={16} /></a>
      </div>
    </main>
  );
}
