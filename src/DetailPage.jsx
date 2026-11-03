import { ArrowRight, ArrowUpRight, Check, ChevronRight, Cpu, Leaf, Globe2 } from 'lucide-react';
import { ProductArt } from './Visuals.jsx';
import { getCatalogItemByRoute, formatPrice } from './commerceData.js';
import GeneralPage from './GeneralPage.jsx';

const productContent = {
  '/products/fpu-apollon-1100': {
    intro: 'FPU Apollon 1100 is the general-purpose heart of the platform. High core density, ??? DDR5 memory channels, and expansive PCIe® connectivity give infrastructure teams a powerful foundation—with or without FPU 1100 acceleration.',
    workloads: [['Virtualization & containers', 'Consolidate demanding application environments with the core density and memory bandwidth needed for dense deployments.'], ['AI host compute', 'Pair Apollon with FPU 1100 to orchestrate data pipelines, model services, and accelerated infrastructure on one balanced platform.'], ['HPC & engineering', 'Tackle compute-intensive simulation and research with a balanced compute, memory, and I/O architecture.']],
    value: 'Deploy Apollon as a standalone server processor or combine it with FPU 1100 when your workloads demand dedicated AI acceleration. One architecture supports both paths, keeping your infrastructure roadmap open.',
  },
  '/products/fpu-1100': {
    intro: 'FPU 1100—Flow Processing Unit—is dedicated AI acceleration for training, fine-tuning, and inference. Pair it with Apollon server processors to create a balanced heterogeneous compute platform.',
    workloads: [['Model training', 'Build and adapt models on acceleration designed to keep large AI workloads supplied with data.'], ['Production inference', 'Serve demanding models with high-bandwidth memory and a platform built to scale from nodes to racks.'], ['Apollon-powered AI systems', 'Combine FPU 1100 acceleration with Apollon host compute for data preparation, orchestration, and AI services.']],
    value: 'FPU 1100 gives AI workloads a dedicated engine while Apollon handles the broader server environment. Together they create a flexible platform for training, inference, and the infrastructure around them.',
  },
  '/products/fpu-force-1100': {
    intro: 'FPU Force 1100 is our server graphics family for organizations that need GPU acceleration beyond AI—from professional visualization to parallel processing and graphics-intensive infrastructure.',
    workloads: [['Professional visualization', 'Support server-side rendering, visual computing, and graphics-intensive professional applications.'], ['Parallel processing', 'Accelerate suitable compute workloads with a server GPU architecture designed for data center deployment.'], ['Virtual graphics infrastructure', 'Build centralized graphics resources for remote and virtualized user environments.']],
    value: 'Force expands the FPU portfolio with a dedicated server GPU line, giving customers a clear choice between AI acceleration, general-purpose compute, and graphics-focused infrastructure.',
  },
  '/systems/flowforce-w-1100': {
    intro: 'FlowForce W 1100 puts serious compute at the desk of people building what comes next. A professional workstation for local AI development, engineering, and graphics-intensive work.',
    workloads: [['AI development', 'Develop, test, and refine models locally before moving workloads into larger infrastructure.'], ['Engineering & simulation', 'Give technical teams a dedicated workstation for demanding computational and design workflows.'], ['Professional visualization', 'Work with complex visual content and GPU-accelerated professional applications.']],
    value: 'Keep iteration close to your team. FlowForce W brings the FPU ecosystem into a workstation form factor, creating a natural bridge between individual development and production deployment.',
  },
  '/systems/flowforce-e-1100': {
    intro: 'FlowForce E 1100 brings AI processing closer to where data is created. A compact edge system for local inference, intelligent devices, and distributed deployments.',
    workloads: [['Edge inference', 'Run suitable AI workloads locally to reduce dependence on round trips to centralized infrastructure.'], ['Intelligent devices', 'Build responsive machine vision, automation, and connected device experiences.'], ['Distributed deployments', 'Create consistent edge nodes for locations where space and deployment flexibility matter.']],
    value: 'FlowForce E extends the platform beyond the data center, helping teams process data locally and build intelligent systems where low latency and compact deployment are important.',
  },
  '/systems/flowsystem-r-1100': {
    intro: 'FlowSystem R 1100 combines Apollon host compute with FPU 1100 acceleration in an enterprise server platform designed for production AI and data center infrastructure.',
    workloads: [['Fine-tuning & inference', 'Deploy accelerated AI services with dedicated FPU compute and Apollon host processing.'], ['Enterprise infrastructure', 'Support demanding applications on a validated server platform with deployment guidance.'], ['Accelerated research', 'Give technical teams a balanced system for model development and computational workloads.']],
    value: 'FlowSystem R brings the compute portfolio together in one deployable enterprise platform, helping teams move from evaluation to production with less integration work.',
  },
  '/software/cloud-platform': {
    intro: 'A clearer way to work with infrastructure is taking shape. GonidonCloud Platform is being designed to bring deployments, resources, orders, and support into one coherent cloud experience.',
    workloads: [['Centralized visibility', 'A planned unified workspace for understanding your infrastructure and keeping essential information within reach.'], ['Guided deployment', 'Planned workflows intended to make the path from configuration to deployment clearer and more approachable.'], ['Connected account', 'A planned connection between your cloud resources, GonidonCloud orders, software downloads, and support.']],
    value: 'The platform is being designed to reduce operational fragmentation and make sophisticated infrastructure feel more approachable. Features and availability will be confirmed as development progresses.',
  },
};

const technicalSpecs = {
  '/products/fpu-apollon-1100': [
    ['Compute architecture', 'FPU Apollon high-density chiplet architecture'], ['Processor cores', 'Up to 192 high-performance cores'], ['Memory', '12-channel DDR5; ECC support'], ['Expansion', 'Up to 160 PCIe® 5.0 lanes'], ['Accelerator support', 'FPU 1100 and FPU Force 1100 platforms'], ['Deployment', 'Single- and dual-socket server configurations'], ['Security', 'Hardware-rooted trust and memory encryption'], ['Target workloads', 'Cloud, virtualization, HPC, data analytics, and AI host compute'],
  ],
  '/products/fpu-1100': [
    ['Processing architecture', 'Flow Processing Unit for AI training and inference'], ['On-package memory', '288 GB high-bandwidth memory'], ['Memory bandwidth', 'Up to 7 TB/s'], ['Host interface', 'PCIe® 5.0 server integration'], ['Host platform', 'FPU Apollon 1100 or compatible server architecture'], ['Scalability', 'Single-node and multi-accelerator FlowSystem configurations'], ['Software model', 'Open AI software stack and documented deployment workflow'], ['Target workloads', 'Model training, fine-tuning, generative AI, and production inference'],
  ],
  '/products/fpu-force-1100': [
    ['Processing architecture', 'FPU Force parallel graphics and compute architecture'], ['Product class', 'Data-center server GPU'], ['Graphics workloads', 'Server-side rendering and professional visualization'], ['Compute workloads', 'Parallel processing and GPU-accelerated applications'], ['Virtualization', 'Centralized and virtual graphics infrastructure'], ['Host platform', 'FPU Apollon 1100 server platforms'], ['Integration', 'Standard server expansion and documented software stack'], ['Target deployments', 'Engineering, media, virtual workstations, and visual computing'],
  ],
  '/systems/flowforce-w-1100': [
    ['System class', 'Professional AI and engineering workstation'], ['Host compute', 'FPU Apollon 1100 processor platform'], ['Acceleration', 'FPU 1100 and FPU Force 1100 configuration options'], ['Memory', 'Multi-channel DDR5 ECC platform memory'], ['Expansion', 'High-speed PCIe® 5.0 device connectivity'], ['Storage', 'High-performance NVMe storage configurations'], ['Deployment', 'Local development, simulation, visualization, and inference'], ['Service', 'Standard three-year limited hardware warranty'],
  ],
  '/systems/flowforce-e-1100': [
    ['System class', 'Compact edge AI computer'], ['Processing platform', 'Integrated FPU compute architecture'], ['Primary workload', 'Low-latency local AI inference'], ['Connectivity', 'Ethernet, high-speed device I/O, and peripheral expansion'], ['Storage', 'Local NVMe storage for models, applications, and data'], ['Software', 'Linux-based edge software environment and remote deployment workflow'], ['Deployment', 'Machine vision, robotics, intelligent devices, and distributed locations'], ['Design focus', 'Compact installation and processing close to the data source'],
  ],
  '/systems/flowsystem-r-1100': [
    ['Form factor', '2U rackmount enterprise server'], ['Host compute', 'Two FPU Apollon 1100 processors'], ['Acceleration', 'Up to eight FPU 1100 AI accelerators'], ['Aggregate accelerator memory', 'Up to 2.25 TB high-bandwidth memory'], ['Memory platform', 'Dual-socket, 24-channel DDR5 ECC architecture'], ['Expansion', 'High-speed PCIe® 5.0 connectivity for storage and networking'], ['Cooling', 'Data-center thermal design; direct liquid-cooling-ready configurations'], ['Management & service', 'Deployment guidance, platform documentation, and enterprise support'],
  ],
};

const enterpriseContent = {
  '/products/fpu-apollon-1100': { description: 'High-volume processor orders with configuration validation, deployment planning, and dedicated commercial support for data-center programs.', specs: [['Configuration', 'Apollon 1100 Enterprise processor program'], ['Order type', 'Volume procurement through GonidonCloud Sales'], ['Validation', 'Platform, memory, and accelerator compatibility review'], ['Deployment', 'Single-socket, dual-socket, and accelerated server planning'], ['Support', 'Enterprise onboarding and deployment coordination'], ['Commercial terms', 'Custom volume, delivery, and service agreement']] },
  '/products/fpu-1100': { description: 'An enterprise AI accelerator program for multi-node deployments, production inference clusters, and large-scale training infrastructure.', specs: [['Configuration', 'FPU 1100 Enterprise accelerator program'], ['Scale', 'Multi-accelerator and multi-node procurement'], ['Memory per accelerator', '288 GB high-bandwidth memory'], ['Integration', 'Apollon host, networking, and system compatibility review'], ['Deployment', 'Reference architecture and cluster planning'], ['Support', 'Enterprise software onboarding and deployment coordination']] },
  '/products/fpu-force-1100': { description: 'Centralized server graphics for professional visualization, virtual workstations, and accelerated enterprise applications, sized around your user and workload requirements.', specs: [['Configuration', 'FPU Force 1100 Enterprise server GPU program'], ['Order type', 'Volume procurement through GonidonCloud Sales'], ['Workload review', 'Rendering, visualization, parallel compute, and VDI assessment'], ['Integration', 'Server, virtualization, and software compatibility planning'], ['Scale', 'Single-server and fleet deployment options'], ['Support', 'Enterprise onboarding and solution engineering']] },
  '/systems/flowforce-w-1100': { description: 'A managed workstation program for engineering and AI teams that need standardized local compute, validated configurations, and coordinated fleet delivery.', specs: [['Configuration', 'FlowForce W 1100 Enterprise Workstation'], ['Host platform', 'FPU Apollon 1100 with enterprise memory configuration'], ['Acceleration', 'Application-specific FPU 1100 or Force 1100 configuration'], ['Fleet options', 'Standardized images, storage, and peripheral requirements'], ['Deployment', 'Multi-system rollout and team environment planning'], ['Service', 'Enterprise warranty and support agreement']] },
  '/systems/flowforce-e-1100': { description: 'Distributed edge AI with procurement, configuration, and rollout support for fleets deployed across industrial, retail, telecommunications, and smart-infrastructure locations.', specs: [['Configuration', 'FlowForce E 1100 Enterprise Edge System'], ['Deployment model', 'Multi-site and fleet procurement'], ['Workload validation', 'Models, sensors, storage, and local inference assessment'], ['Connectivity', 'Site-specific networking and peripheral planning'], ['Operations', 'Standardized software and remote rollout planning'], ['Service', 'Enterprise deployment and support coordination']] },
  '/systems/flowsystem-r-1100': { description: 'A configurable accelerated server platform for enterprise AI factories, research clusters, and production data centers, designed with our sales and systems engineering teams.', specs: [['Configuration', 'FlowSystem R 1100 Enterprise Server'], ['Host compute', 'Dual FPU Apollon 1100 processor architecture'], ['Acceleration', 'Up to eight FPU 1100 accelerators per node'], ['Infrastructure', 'Rack, networking, storage, power, and cooling planning'], ['Validation', 'Workload benchmarking and reference architecture review'], ['Service', 'Custom deployment, warranty, and enterprise support agreement']] },
};

export default function DetailPage({ page, onContact, news = [], onArticle }) {
  if (!page) {
    return (
      <main className="not-found">
        <div className="container"><span className="eyebrow eyebrow--red">404 / PAGE NOT FOUND</span><h1>This page is off the grid.</h1><p>The address may have changed. Head back home or explore our latest compute platform.</p><div><a className="button button--dark" href="#/">Back to home <ArrowRight size={17} /></a><a className="button detail-outline-button" href="#/products/fpu-apollon-1100">Explore FPU 1100</a></div></div>
      </main>
    );
  }

  const purchasable = getCatalogItemByRoute(page.route);
  const content = productContent[page.route];
  if (page.category === 'Enterprise') return <EnterpriseProductPage page={page} />;
  if (content) return <ProductExperience page={page} content={content} purchasable={purchasable} onContact={onContact} />;
  return <GeneralPage page={page} onContact={onContact} news={news} onArticle={onArticle} />;

  return (
    <main className="detail-page">
      <section className="detail-hero">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Breadcrumb"><a href="#/">Home</a><ChevronRight size={13} /><span>{page.category}</span><ChevronRight size={13} /><span aria-current="page">{page.title}</span></nav>
          <nav className="detail-subnav" aria-label={`${page.title} sections`}><strong>{page.title}</strong><div><button onClick={() => document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth' })}>Overview</button>{page.stats && <button onClick={() => document.getElementById('specifications')?.scrollIntoView({ behavior: 'smooth' })}>Specifications</button>}<button onClick={() => document.getElementById('resources')?.scrollIntoView({ behavior: 'smooth' })}>Resources</button></div></nav>
          <div className="detail-hero__inner" id="overview">
            <div className="detail-hero__content"><span className="eyebrow eyebrow--red">GONIDONCLOUD / {page.category.toUpperCase()}</span>{page.status && <span className="detail-status-badge">{page.status}</span>}<h1>{page.title}</h1><p>{page.description}</p><div className="detail-hero__actions">{purchasable ? <a className="button button--red" href={`#/checkout/${purchasable.id}`}>Pre-order from {formatPrice(purchasable.unitAmount)}<ArrowRight size={17} /></a> : page.status ? <button className="button button--red" type="button" disabled>{page.status}</button> : <button className="button button--red" onClick={onContact}>{page.category === 'Support' ? 'Get support' : page.route === '/company/careers' ? 'Talk to our talent team' : 'Talk to an engineer'}<ArrowRight size={17} /></button>}{(page.category === 'Products' || page.category === 'Systems') && <a className="button detail-outline-button" href="https://gonidoncloud.github.io/fpu-documentation/" target="_blank" rel="noreferrer">View documentation <ArrowUpRight size={16} /></a>}{purchasable && <button className="detail-sales-link" onClick={onContact}>Talk to an engineer</button>}</div></div>
            <div className={`detail-hero__visual detail-hero__visual--${page.visual}`}><span className="detail-hero__visual-tag">ENGINEERED FOR WHAT'S NEXT</span><ProductArt type={page.visual} /><div className="detail-hero__visual-grid" /></div>
          </div>
        </div>
      </section>

      {page.stats && <section className="detail-stats" id="specifications" aria-label="Key specifications"><div className="container">{page.stats.map((stat) => <div key={stat.label}><strong>???</strong><span>{stat.label}</span></div>)}</div></section>}

      {page.showNews ? (
        <section className="section detail-news"><div className="container"><div className="detail-section-heading"><span className="eyebrow">LATEST STORIES</span><h2>News from GonidonCloud.</h2></div><div className="news-grid">{news.map((article) => <article className="news-card" key={article.title}><button className={`news-card__art news-card__art--${article.art}`} onClick={() => onArticle(article)} aria-label={`Read: ${article.title}`}>{article.art === 'chip' && <Cpu size={80} strokeWidth={.7} />}{article.art === 'network' && <><Globe2 size={92} strokeWidth={.65} /><span className="network-dot network-dot--one" /><span className="network-dot network-dot--two" /></>}{article.art === 'building' && <><div className="building-shape" /><Leaf size={56} strokeWidth={.9} /></>}</button><div className="news-card__body"><div className="news-card__meta"><span>{article.type}</span><time>{article.date}</time></div><h3>{article.title}</h3><button className="text-link" onClick={() => onArticle(article)}>Read the story <ArrowUpRight size={16} /></button></div></article>)}</div></div></section>
      ) : (
        <section className="section detail-overview"><div className="container"><div className="detail-section-heading"><span className="eyebrow">WHY GONIDONCLOUD</span><h2>{page.contentTitle}</h2><p>{page.description}</p></div><div className="detail-features">{page.features.map((feature, index) => <article key={feature.title}><span>0{index + 1}</span><h3>{feature.title}</h3><p>{feature.text}</p></article>)}</div></div></section>
      )}

      {content && <>
        <section className="section product-story"><div className="container"><div className="product-story__intro"><span className="eyebrow eyebrow--red">MEET YOUR NEXT PLATFORM</span><h2>More capability.<br />More ways to move forward.</h2><p>{content.intro}</p></div><div className="product-workloads">{content.workloads.map(([title, description], index) => <article key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{description}</p></div></article>)}</div></div></section>

        <section className="product-value"><div className="container product-value__inner"><div><span className="eyebrow">A PLATFORM FOR THE ROAD AHEAD</span><h2>Invest in infrastructure that keeps your options open.</h2></div><div><p>{content.value}</p><ul><li><Check size={17} /> Open architecture and industry-standard technologies</li><li><Check size={17} /> Engineering guidance from evaluation through deployment</li><li><Check size={17} /> Technical documentation and ongoing product support</li></ul></div></div></section>

        <section className="section product-decision"><div className="container product-decision__inner"><div><span className="eyebrow eyebrow--red">MAKE YOUR NEXT MOVE</span><h2>Build your next deployment on {page.title}.</h2><p>Reserve your place in the first production wave or talk with an engineer about the right configuration for your workload. Expected first shipments: Q1 2027.</p></div><div className="product-decision__action">{purchasable && <strong>From {formatPrice(purchasable.unitAmount)}</strong>}{purchasable ? <a className="button button--red" href={`#/checkout/${purchasable.id}`}>Secure your pre-order <ArrowRight size={17} /></a> : <button className="button button--red" onClick={onContact}>Plan your deployment <ArrowRight size={17} /></button>}<button className="detail-sales-link" onClick={onContact}>Need help choosing? Talk to an engineer</button></div></div></section>
      </>}

      <section className="detail-spotlight"><div className="container detail-spotlight__inner"><div><span className="eyebrow">DESIGNED FOR YOUR AMBITIONS</span><h2>{page.features[0].title}</h2><p>{page.features[0].text}</p><a href="https://gonidoncloud.github.io/fpu-documentation/" target="_blank" rel="noreferrer" className="text-link text-link--light">Explore technical documentation <ArrowUpRight size={17} /></a></div><div className="detail-spotlight__spec"><Cpu size={42} strokeWidth={1.2} /><span>GONIDONCLOUD TECHNOLOGY</span><strong>{page.stats?.[0]?.value || 'Open'}</strong><p>{page.stats?.[0]?.label || 'A platform designed to move your work forward.'}</p></div></div></section>

      <section className="section detail-deployment"><div className="container"><div className="detail-section-heading"><span className="eyebrow">FROM EVALUATION TO DEPLOYMENT</span><h2>Built to fit your next move.</h2><p>Explore the platform, validate your workload with our engineering team, and plan a deployment around your operational requirements.</p></div><div className="detail-deployment__grid"><article><span>01</span><h3>Discover</h3><p>Review architecture, capabilities, and technical documentation for your workload.</p></article><article><span>02</span><h3>Validate</h3><p>Work with GonidonCloud engineers to assess compatibility, configuration, and scale.</p></article><article><span>03</span><h3>Deploy</h3><p>Move forward with a validated platform, implementation guidance, and ongoing support.</p></article></div></div></section>

      <section className="detail-related" id="resources"><div className="container"><div className="detail-related__heading"><h2>Keep exploring.</h2><span>RELATED RESOURCES</span></div><div className="detail-related__grid">{page.related.filter((item) => item.to !== page.route).slice(0, 3).map((item) => <a href={item.title === 'Documentation' ? 'https://gonidoncloud.github.io/fpu-documentation/' : `#${item.to}`} target={item.title === 'Documentation' ? '_blank' : undefined} rel={item.title === 'Documentation' ? 'noreferrer' : undefined} key={item.to}><div><span className="eyebrow">GONIDONCLOUD</span><h3>{item.title}</h3><p>{item.text}</p></div><ArrowUpRight size={21} /></a>)}</div></div></section>

      <section className="detail-cta"><div className="container"><div><span className="eyebrow">LET'S BUILD TOGETHER</span><h2>Ready to take the next step?</h2></div><button className="button button--light" onClick={onContact}>Talk to our team <ArrowRight size={18} /></button></div></section>
    </main>
  );
}


function EnterpriseProductPage({ page }) {
  const baseRoute = page.route.replace('/enterprise/', page.route.includes('flow') ? '/systems/' : '/products/');
  const enterprise = enterpriseContent[baseRoute];
  const email = `mailto:sales@gonidoncloud.com?subject=${encodeURIComponent(`${page.title} inquiry`)}`;
  return <main className="product-experience enterprise-page">
    <nav className="experience-subnav"><div className="container"><strong>{page.title}</strong><div><a href={`#${baseRoute}`}>Standard edition</a><button onClick={() => document.getElementById('enterprise-specifications')?.scrollIntoView({ behavior: 'smooth' })}>Specifications</button></div><a className="experience-buy" href={email}>Contact Sales</a></div></nav>
    <section className="experience-hero"><div className="container"><span className="experience-kicker">GONIDONCLOUD / ENTERPRISE</span><h1>{page.title}</h1><p className="experience-hero__tagline">{page.description}</p><div className="experience-links"><a href={email}>Request a configuration <ArrowRight size={18} /></a><a href={`#${baseRoute}`}>Explore standard edition <ArrowUpRight size={17} /></a></div><div className="experience-hero__visual"><ProductArt type={page.visual} /></div><p className="experience-availability">Available exclusively through GonidonCloud Sales.</p></div></section>
    <section className="experience-intro"><div className="container"><span>ENTERPRISE BY DESIGN</span><h2>{enterprise.description}</h2></div></section>
    <section className="enterprise-product"><div className="container"><div className="enterprise-product__heading"><div><span>YOUR INFRASTRUCTURE. YOUR CONFIGURATION.</span><h2>Engineered around<br />your deployment.</h2></div><div><p>Work with our sales and systems engineering teams to define the right configuration, validate your workload, and plan delivery and support.</p><a className="button button--light" href={email}>Talk to Sales <ArrowUpRight size={17} /></a></div></div></div></section>
    <section className="technical-specs" id="enterprise-specifications"><div className="container"><div className="experience-section-title"><span>ENTERPRISE SPECIFICATIONS</span><h2>Technical and<br />commercial overview.</h2><p>Preliminary details for planning your {page.title} deployment.</p></div><dl className="technical-specs__list">{enterprise.specs.map(([label]) => <div key={label}><dt>{label}</dt><dd>???</dd></div>)}</dl><p className="technical-specs__note">Preliminary enterprise specifications. Final configurations, pricing, delivery, and support terms are confirmed with GonidonCloud Sales.</p></div></section>
    <section className="experience-final"><div className="container"><span>ENTERPRISE SALES</span><h2>Let’s design your<br />deployment.</h2><p>Tell us about your workload, deployment scale, and delivery requirements. Our team will help define the right enterprise configuration.</p><a className="experience-final__buy" href={email}>Contact Sales <ArrowUpRight size={19} /></a><small>Enterprise products are not available through online pre-order.</small></div></section>
  </main>;
}

function ProductExperience({ page, content, purchasable, onContact }) {
  const shortName = page.route === '/software/cloud-platform' ? 'Cloud Platform' : page.title.replace('GonidonCloud ', '');
  const comingSoon = Boolean(page.status);
  const enterprise = enterpriseContent[page.route];
  return <main className="product-experience">
    <nav className="experience-subnav" aria-label={`${page.title} sections`}><div className="container"><strong>{shortName}</strong><div><button onClick={() => document.getElementById('experience-overview')?.scrollIntoView({ behavior: 'smooth' })}>Overview</button>{page.stats && <button onClick={() => document.getElementById('experience-technology')?.scrollIntoView({ behavior: 'smooth' })}>Technology</button>}<button onClick={() => document.getElementById('experience-workloads')?.scrollIntoView({ behavior: 'smooth' })}>Workloads</button>{enterprise && <a href={`#${page.route.replace('/products/', '/enterprise/').replace('/systems/', '/enterprise/')}`}>Enterprise</a>}</div>{purchasable ? <a className="experience-buy" href={`#/checkout/${purchasable.id}`}>Pre-order</a> : <button className="experience-buy" onClick={comingSoon ? undefined : onContact} disabled={comingSoon}>{comingSoon ? page.status : 'Contact us'}</button>}</div></nav>

    <section className="experience-hero" id="experience-overview"><div className="container"><span className="experience-kicker">{page.category === 'Systems' ? 'GONIDONCLOUD SYSTEMS' : page.category === 'Software' ? 'GONIDONCLOUD SOFTWARE' : 'GONIDONCLOUD SILICON'}</span><h1>{shortName}</h1><p className="experience-hero__tagline">{page.description}</p><div className="experience-links">{purchasable ? <a href={`#/checkout/${purchasable.id}`}>Pre-order from {formatPrice(purchasable.unitAmount)} <ArrowRight size={18} /></a> : <button onClick={comingSoon ? undefined : onContact} disabled={comingSoon}>{comingSoon ? page.status : 'Plan your deployment'} {!comingSoon && <ArrowRight size={18} />}</button>}<a href="https://gonidoncloud.github.io/fpu-documentation/" target="_blank" rel="noreferrer">View documentation <ArrowUpRight size={17} /></a></div><div className="experience-hero__visual"><ProductArt type={page.visual} /></div><p className="experience-availability">{comingSoon ? 'Currently in development. Features and availability will be announced.' : 'Pre-order now. First shipments expected Q1 2027.'}</p></div></section>

    <section className="experience-intro"><div className="container"><span>WHY {shortName.toUpperCase()}</span><h2>{content.intro}</h2></div></section>

    {page.stats && <section className="experience-stats" id="experience-technology"><div className="container">{page.stats.map((stat) => <div key={stat.label}><strong>???</strong><span>{stat.label}</span></div>)}</div></section>}

    {technicalSpecs[page.route] && <section className="technical-specs"><div className="container"><div className="experience-section-title"><span>TECHNICAL OVERVIEW</span><h2>The details behind<br />the performance.</h2><p>Explore the planned launch architecture and deployment capabilities of {shortName}.</p></div><dl className="technical-specs__list">{technicalSpecs[page.route].map(([label]) => <div key={label}><dt>{label}</dt><dd>???</dd></div>)}</dl><p className="technical-specs__note">Specifications describe planned launch configurations. Final availability and validated configurations may vary by system and deployment.</p></div></section>}

    <section className="experience-bento"><div className="container"><div className="experience-section-title"><span>ENGINEERED TOGETHER</span><h2>Every detail has a purpose.<br />Every capability moves you forward.</h2></div><div className="experience-bento__grid"><article className="experience-bento__large"><span>ARCHITECTURE</span><h3>{page.features[0].title}</h3><p>{page.features[0].text}</p><div className="experience-bento__orb"><ProductArt type={page.visual} /></div></article><article><span>OPEN PLATFORM</span><h3>{page.features[1].title}</h3><p>{page.features[1].text}</p><div className="experience-bento__line" /></article><article><span>{comingSoon ? 'DESIGNED FOR YOUR ACCOUNT' : 'PRODUCTION READY'}</span><h3>{page.features[2].title}</h3><p>{page.features[2].text}</p><div className="experience-bento__checks"><span><Check size={16} /> Evaluate</span><span><Check size={16} /> Validate</span><span><Check size={16} /> Deploy</span></div></article></div></div></section>

    <section className="experience-workloads" id="experience-workloads"><div className="container"><div className="experience-section-title"><span>BUILT FOR WHAT YOU’RE BUILDING</span><h2>One platform.<br />Extraordinary range.</h2></div><div className="experience-workload-grid">{content.workloads.map(([title, description], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{description}</p></article>)}</div></div></section>

    <section className="experience-value"><div className="container"><span>THE GONIDONCLOUD DIFFERENCE</span><h2>Power for today.<br />Possibility for tomorrow.</h2><p>{content.value}</p><a href="#/company/about">Discover our approach <ArrowRight size={18} /></a></div></section>

    <section className="experience-final"><div className="container"><span>{shortName}</span><h2>{comingSoon ? <>Infrastructure, beautifully<br />connected.</> : <>Your next breakthrough<br />starts here.</>}</h2><p>{comingSoon ? 'A new cloud experience is on the way. We are designing every detail to make working with GonidonCloud infrastructure feel simpler and more coherent.' : 'Join the first production wave or work with our engineers to design the right deployment for your workload.'}</p>{purchasable ? <a className="experience-final__buy" href={`#/checkout/${purchasable.id}`}>Pre-order now <ArrowRight size={20} /></a> : <button className="experience-final__buy" onClick={comingSoon ? undefined : onContact} disabled={comingSoon}>{comingSoon ? page.status : 'Plan your deployment'} {!comingSoon && <ArrowRight size={20} />}</button>}<small>{comingSoon ? 'Coming Soon. Platform capabilities and availability are subject to change during development.' : 'Expected first shipments Q1 2027. Configuration and delivery are confirmed during order review.'}</small></div></section>
  </main>;
}
