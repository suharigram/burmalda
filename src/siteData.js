export const linkRoutes = {
  'FPU Apollon 1100 Server Processors': '/products/fpu-apollon-1100',
  'FPU 1100 AI Accelerators': '/products/fpu-1100',
  'FPU Force 1100 Server GPUs': '/products/fpu-force-1100',
  'FlowForce W 1100 Workstation': '/systems/flowforce-w-1100',
  'FlowForce E 1100 Edge System': '/systems/flowforce-e-1100',
  'FlowSystem R 1100 Enterprise Servers': '/systems/flowsystem-r-1100',
  'FPU Apollon 1100 Enterprise': '/enterprise/fpu-apollon-1100',
  'FPU 1100 Enterprise': '/enterprise/fpu-1100',
  'FPU Force 1100 Enterprise': '/enterprise/fpu-force-1100',
  'FlowForce W 1100 Enterprise': '/enterprise/flowforce-w-1100',
  'FlowForce E 1100 Enterprise': '/enterprise/flowforce-e-1100',
  'FlowSystem R 1100 Enterprise': '/enterprise/flowsystem-r-1100',
  'Reference Architectures': '/resources/reference-architectures',
  'Artificial Intelligence': '/solutions/ai',
  'Cloud Computing': '/solutions/cloud',
  'High-Performance Computing': '/solutions/hpc',
  'Data Analytics': '/solutions/data-analytics',
  'Financial Services': '/solutions/financial-services',
  'Healthcare & Life Sciences': '/solutions/healthcare',
  'Manufacturing': '/solutions/manufacturing',
  'Telecommunications': '/solutions/telecommunications',
  'Documentation': 'https://mindpick.github.io/fpu-documentation/',
  'Cloud Platform': '/software/cloud-platform',
  'Developer Hub': '/resources/developer-hub',
  'Partner Network': '/partners',
  'Support Center': '/support',
  'Drivers & Downloads': '/support/downloads',
  'Warranty Services': '/support/warranty',
  'About Us': '/company/about',
  'Leadership': '/company/leadership',
  'Newsroom': '/company/newsroom',
  'Careers': '/company/careers',
  'Contact us': '/company/contact',
  'Corporate Responsibility': '/company/responsibility',
  'Sustainability': '/company/sustainability',
  'Diversity & Inclusion': '/company/diversity',
  'Supplier Hub': '/partners/suppliers',
};

const productFeatures = [
  { title: 'Performance with purpose', text: 'A balanced architecture designed to keep demanding workloads moving efficiently.' },
  { title: 'Open at every layer', text: 'Industry-standard software and modular system design help you avoid unnecessary lock-in.' },
  { title: 'Validated for production', text: 'Tested with leading platforms and supported by Mindpick systems engineers.' },
];

const solutionFeatures = [
  { title: 'Start with your workload', text: 'Reference configurations help align compute, memory, networking, and storage with your goals.' },
  { title: 'Scale without friction', text: 'Move from proof of concept to production on a consistent, open infrastructure platform.' },
  { title: 'Measure what matters', text: 'Optimize for time to results, operational efficiency, and long-term infrastructure value.' },
];

const resourceFeatures = [
  { title: 'Clear and practical', text: 'Straightforward guidance created by the engineers who design and validate our platforms.' },
  { title: 'Built for real deployments', text: 'Use proven configurations and examples to reduce the path from evaluation to production.' },
  { title: 'Expert help when needed', text: 'Connect with Mindpick specialists for architectural and implementation guidance.' },
];

const companyFeatures = [
  { title: 'Engineering with intent', text: 'We focus on durable technology, open collaboration, and meaningful customer outcomes.' },
  { title: 'Progress through partnership', text: 'Our best work happens when customers, partners, and engineers solve problems together.' },
  { title: 'Accountable by design', text: 'We set clear goals and build responsible practices into the way we operate.' },
];

const makePage = (category, title, description, visual = 'processor', extra = {}) => ({
  category,
  title,
  description,
  visual,
  contentTitle: category === 'Products' || category === 'Systems' ? 'Engineered for what comes next.' : category === 'Solutions' ? 'Infrastructure aligned to your ambition.' : category === 'Company' ? 'Technology moves forward when we do it together.' : 'Everything you need to move forward.',
  features: category === 'Products' || category === 'Systems' ? productFeatures : category === 'Solutions' ? solutionFeatures : category === 'Company' ? companyFeatures : resourceFeatures,
  ...extra,
});

export const pages = {
  '/products/fpu-apollon-1100': makePage('Products', 'FPU Apollon 1100 Server Processors', 'High-density server processors designed to power infrastructure independently or work in concert with FPU 1100 AI accelerators.', 'processor', {
    contentTitle: 'The compute core of your next platform.',
    stats: [{ value: '192', label: 'high-performance cores' }, { value: '12', label: 'DDR5 memory channels' }, { value: '160', label: 'PCIe® 5.0 lanes' }],
    features: [
      { title: 'Apollon compute architecture', text: 'High-density compute chiplets deliver exceptional throughput for virtualized, containerized, and compute-intensive workloads.' },
      { title: 'Designed for heterogeneous compute', text: 'Deploy Apollon independently or pair it with FPU 1100 accelerators to balance general-purpose compute and AI acceleration.' },
      { title: 'Security built into silicon', text: 'Hardware-rooted trust and memory encryption help protect sensitive data without slowing your business.' },
    ],
  }),
  '/products/fpu-1100': makePage('Products', 'FPU 1100 AI Accelerators', 'Flow Processing Unit acceleration for AI training and inference, designed to complement Apollon servers and scale from nodes to AI factories.', 'accelerator', {
    contentTitle: 'Flow through your most demanding AI work.',
    stats: [{ value: '288 GB', label: 'high-bandwidth memory' }, { value: '7 TB/s', label: 'memory bandwidth' }, { value: 'Open', label: 'software ecosystem' }],
  }),
  '/products/fpu-force-1100': makePage('Products', 'FPU Force 1100 Server GPUs', 'A server graphics lineup for visualization, parallel processing, and GPU-accelerated enterprise workloads.', 'accelerator', {
    contentTitle: 'Server graphics, built for serious work.',
    stats: [{ value: 'Server', label: 'graphics product family' }, { value: 'GPU', label: 'parallel acceleration' }, { value: 'Open', label: 'software approach' }],
  }),
  '/systems/flowforce-w-1100': makePage('Systems', 'FlowForce W 1100 Workstation', 'A high-performance workstation for AI development, engineering, visualization, and demanding professional workflows.', 'server', {
    stats: [{ value: 'Desktop', label: 'professional workstation' }, { value: 'FPU', label: 'compute platform' }, { value: 'Open', label: 'software approach' }],
  }),
  '/systems/flowforce-e-1100': makePage('Systems', 'FlowForce E 1100 Edge System', 'A compact edge computer for local AI, intelligent devices, and inference where low latency and deployment flexibility matter.', 'server', {
    stats: [{ value: 'Compact', label: 'edge system design' }, { value: 'Edge AI', label: 'local inference workloads' }, { value: 'Open', label: 'software approach' }],
  }),
  '/systems/flowsystem-r-1100': makePage('Systems', 'FlowSystem R 1100 Enterprise Servers', 'Enterprise server systems combining Apollon host compute, FPU acceleration, and deployment support for production infrastructure.', 'server', {
    stats: [{ value: '2U', label: 'flexible form factor' }, { value: '8', label: 'FPU 1100 accelerator capacity' }, { value: '2', label: 'FPU Apollon 1100 processors' }],
  }),
  '/enterprise/fpu-apollon-1100': makePage('Enterprise', 'FPU Apollon 1100 Enterprise', 'Volume processor procurement, platform validation, and deployment support for enterprise data-center programs.', 'processor'),
  '/enterprise/fpu-1100': makePage('Enterprise', 'FPU 1100 Enterprise', 'Enterprise AI acceleration for multi-node training, production inference, and scalable accelerated infrastructure.', 'accelerator'),
  '/enterprise/fpu-force-1100': makePage('Enterprise', 'FPU Force 1100 Enterprise', 'Centralized server graphics and parallel compute for professional visualization, virtual workstations, and enterprise applications.', 'accelerator'),
  '/enterprise/flowforce-w-1100': makePage('Enterprise', 'FlowForce W 1100 Enterprise', 'Standardized professional workstations for engineering and AI teams, with validated configurations and coordinated fleet delivery.', 'server'),
  '/enterprise/flowforce-e-1100': makePage('Enterprise', 'FlowForce E 1100 Enterprise', 'Distributed edge AI systems with configuration, rollout, and support for multi-site enterprise deployments.', 'server'),
  '/enterprise/flowsystem-r-1100': makePage('Enterprise', 'FlowSystem R 1100 Enterprise', 'Configurable accelerated server infrastructure for enterprise AI, research clusters, and production data centers.', 'server'),
  '/solutions/ai': makePage('Solutions', 'Artificial Intelligence', 'Build, train, and deploy AI on open infrastructure designed for performance today and flexibility tomorrow.', 'accelerator', {
    stats: [{ value: '3.2×', label: 'projected AI throughput per rack' }, { value: 'Open', label: 'software approach' }, { value: '1', label: 'unified architecture' }],
  }),
  '/solutions/cloud': makePage('Solutions', 'Cloud Computing', 'Deliver more services with less infrastructure using efficient compute and validated cloud-scale systems.', 'server', { stats: [{ value: '42%', label: 'projected footprint reduction' }, { value: '2×', label: 'target workload density' }, { value: '99.99%', label: 'platform availability target' }] }),
  '/solutions/hpc': makePage('Solutions', 'High-Performance Computing', 'Solve larger scientific and engineering problems with high core counts, massive bandwidth, and open HPC software.', 'processor', { stats: [{ value: '2.7×', label: 'projected time-to-results gain' }, { value: '12', label: 'memory channels per CPU' }, { value: 'Open', label: 'HPC software support' }] }),
  '/solutions/data-analytics': makePage('Solutions', 'Data Analytics', 'Turn larger datasets into faster decisions with balanced compute, memory, storage, and high-speed I/O.', 'processor', { stats: [{ value: '68%', label: 'projected faster queries' }, { value: '160', label: 'PCIe® 5.0 lanes' }, { value: '12', label: 'memory channels' }] }),
  '/solutions/financial-services': makePage('Solutions', 'Financial Services', 'Accelerate risk analysis, fraud detection, and real-time transactions with secure, low-latency infrastructure.', 'server'),
  '/solutions/healthcare': makePage('Solutions', 'Healthcare & Life Sciences', 'Advance research, imaging, and patient insight with secure compute for data-intensive discovery.', 'processor'),
  '/solutions/manufacturing': makePage('Solutions', 'Manufacturing', 'Power simulation, digital twins, and intelligent operations from the engineering workstation to the factory edge.', 'server'),
  '/solutions/telecommunications': makePage('Solutions', 'Telecommunications', 'Build efficient, scalable networks with high-throughput compute for core, edge, and AI-native services.', 'processor'),
  '/software/cloud-platform': makePage('Software', 'Mindpick Platform', 'A unified cloud experience for discovering, deploying, and managing Mindpick infrastructure is currently in development.', 'server', {
    status: 'COMING SOON',
    contentTitle: 'Your infrastructure. One clear view.',
    features: [
      { title: 'Planned: centralized management', text: 'A single workspace is planned for organizing infrastructure, reviewing deployments, and keeping track of your cloud resources.' },
      { title: 'Planned: streamlined deployment', text: 'Guided workflows are intended to help teams move from selecting a configuration to preparing a deployment with less operational friction.' },
      { title: 'Planned: account-ready access', text: 'The platform is being designed around your Mindpick account, with orders, software resources, and support close at hand.' },
    ],
  }),
  '/resources/reference-architectures': makePage('Resources', 'Reference Architectures', 'Start with validated combinations of compute, accelerators, networking, storage, and software for common workloads.', 'server'),
  '/resources/documentation': makePage('Resources', 'Documentation', 'Find installation guides, platform specifications, compatibility information, and deployment best practices.', 'server'),
  '/resources/developer-hub': makePage('Resources', 'Developer Hub', 'Build on open software with quickstarts, APIs, code samples, optimization guides, and community projects.', 'accelerator'),
  '/partners': makePage('Resources', 'Partner Network', 'Connect with system integrators, cloud providers, software innovators, and channel partners in the Mindpick ecosystem.', 'server'),
  '/partners/suppliers': makePage('Resources', 'Supplier Hub', 'Access supplier expectations, responsible sourcing standards, onboarding resources, and partnership contacts.', 'server'),
  '/support': makePage('Support', 'Support Center', 'Get help with product selection, deployment, platform operation, and ongoing technical support.', 'server'),
  '/support/downloads': makePage('Support', 'Drivers & Downloads', 'Find the latest validated platform software, firmware, drivers, and release documentation for your Mindpick system.', 'processor'),
  '/support/warranty': makePage('Support', 'Warranty Services', 'Understand coverage, check service options, and get help with hardware warranty requests.', 'server'),
  '/company/about': makePage('Company', 'About Mindpick', 'We are a team of engineers and problem-solvers building open, efficient processors and systems for the next era of computing.', 'processor'),
  '/company/leadership': makePage('Company', 'Leadership', 'Meet the team bringing together deep silicon, systems, software, and operational experience to build a different kind of compute company.', 'server'),
  '/company/newsroom': makePage('Company', 'Newsroom', 'The latest product announcements, partnerships, and stories from Mindpick.', 'processor', { showNews: true }),
  '/company/careers': makePage('Company', 'Careers at Mindpick', 'Join engineers, researchers, and builders working on the foundations of the next generation of computing.', 'processor'),
  '/company/responsibility': makePage('Company', 'Corporate Responsibility', 'We aim to create long-term value through responsible engineering, transparent operations, and positive community impact.', 'server'),
  '/company/sustainability': makePage('Company', 'Sustainability', 'Designing more efficient computing and reducing environmental impact across products, operations, and the supply chain.', 'processor', { stats: [{ value: '30%', label: 'target energy-use reduction' }, { value: '100%', label: 'renewable operations goal' }, { value: '2035', label: 'net-zero ambition' }] }),
  '/company/diversity': makePage('Company', 'Diversity & Inclusion', 'Different perspectives make better technology. We are building a workplace where every engineer can contribute and belong.', 'server'),
  '/company/contact': makePage('Company', 'Contact us', 'Connect with Mindpick for product guidance, technical support, partnerships, careers, and company inquiries.', 'server'),
};

const relatedByCategory = {
  Products: [{ title: 'FlowSystem R 1100 Enterprise Servers', text: 'Deploy a balanced Apollon and FPU infrastructure platform.', to: '/systems/flowsystem-r-1100' }, { title: 'Reference Architectures', text: 'Start with a proven configuration for your workload.', to: '/resources/reference-architectures' }, { title: 'Documentation', text: 'Explore specifications and deployment guidance.', to: '/resources/documentation' }],
  Systems: [{ title: 'FPU Apollon 1100 Processors', text: 'Meet the host compute platform inside FlowSystem R servers.', to: '/products/fpu-apollon-1100' }, { title: 'AI Infrastructure', text: 'Build an open foundation for training and inference.', to: '/solutions/ai' }, { title: 'Support Center', text: 'Plan your deployment with an infrastructure expert.', to: '/support' }],
  Solutions: [{ title: 'FPU Apollon 1100 Processors', text: 'High-density host compute for demanding workloads.', to: '/products/fpu-apollon-1100' }, { title: 'FPU 1100 AI Accelerators', text: 'Flow Processing Unit acceleration for training and inference.', to: '/products/fpu-1100' }, { title: 'Reference Architectures', text: 'See how the complete platform fits together.', to: '/resources/reference-architectures' }],
  Company: [{ title: 'Our technology', text: 'Explore the FPU Apollon 1100 architecture.', to: '/products/fpu-apollon-1100' }, { title: 'Newsroom', text: 'Read the latest from Mindpick.', to: '/company/newsroom' }, { title: 'Careers', text: 'Build the future of compute with us.', to: '/company/careers' }],
  default: [{ title: 'Developer Hub', text: 'Start building with open tools and examples.', to: '/resources/developer-hub' }, { title: 'Reference Architectures', text: 'Explore validated infrastructure designs.', to: '/resources/reference-architectures' }, { title: 'Contact an Expert', text: 'Get practical guidance from our engineering team.', to: '/support' }],
};

export function getPage(route) {
  const page = pages[route];
  if (!page) return null;
  return { ...page, route, related: relatedByCategory[page.category] || relatedByCategory.default };
}
