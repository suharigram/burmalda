import { ArrowUpRight, Download } from 'lucide-react';

const drivers = [
  { name: 'FPU Apollon 1100 Platform Driver', product: 'FPU Apollon 1100 Server Processors', version: '1.0.0', os: 'Linux · 64-bit', url: '' },
  { name: 'FPU 1100 AI Accelerator Driver', product: 'FPU 1100 AI Accelerators', version: '1.0.0', os: 'Linux · 64-bit', url: '' },
  { name: 'FPU Force 1100 Graphics Driver', product: 'FPU Force 1100 Server GPUs', version: '1.0.0', os: 'Linux · 64-bit', url: '' },
  { name: 'FlowForce System Driver Package', product: 'FlowForce W 1100 and E 1100', version: '1.0.0', os: 'Linux · 64-bit', url: '' },
];

export default function DriversPage() {
  return <main className="drivers-page"><div className="container">
    <header className="drivers-header"><span className="eyebrow eyebrow--red">DRIVERS & DOWNLOADS</span><h1>Drivers.</h1><p>Download official software for your Mindpick products. Driver packages include the components needed to enable and manage supported hardware.</p></header>
    <section className="drivers-list" aria-label="Available drivers">
      {drivers.map((driver) => <article className="driver-row" key={driver.name}>
        <div><h2>{driver.name}</h2><p>{driver.product}</p><span>Version {driver.version} · {driver.os}</span></div>
        {driver.url ? <a className="button button--dark" href={driver.url} download>Download <Download size={17} /></a> : <button className="button button--dark" type="button" disabled title="Download link coming soon">Download <Download size={17} /></button>}
      </article>)}
    </section>
    <p className="drivers-note">Download packages are being prepared. For installation instructions, system requirements, and release information, visit <a href="https://mindpick.github.io/fpu-documentation/" target="_blank" rel="noreferrer">Documentation <ArrowUpRight size={15} /></a>.</p>
  </div></main>;
}
