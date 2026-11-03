export const PREORDER_SHIPPING = 'Q1 2027';

export const catalog = [
  {
    id: 'fpu-apollon-1100', route: '/products/fpu-apollon-1100', name: 'FPU Apollon 1100 Server Processor',
    description: 'Apollon server processor, deployable standalone or with FPU 1100 AI accelerators. Technical specifications: ???. Standard three-year limited warranty.',
    unitAmount: 490000, currency: 'usd', visual: 'processor', maxQuantity: 8,
    leadTime: `Pre-order · expected to ship ${PREORDER_SHIPPING}`, preOrder: true,
  },
  {
    id: 'fpu-1100', route: '/products/fpu-1100', name: 'FPU 1100 AI Accelerator',
    description: 'FPU AI accelerator with open software stack. Technical specifications: ???. Standard three-year limited warranty.',
    unitAmount: 1890000, currency: 'usd', visual: 'accelerator', maxQuantity: 8,
    leadTime: `Pre-order · expected to ship ${PREORDER_SHIPPING}`, preOrder: true,
  },
  {
    id: 'fpu-force-1100', route: '/products/fpu-force-1100', name: 'FPU Force 1100 Server GPU',
    description: 'Server graphics card for visualization, rendering, simulation, and accelerated computing. Standard three-year limited warranty.',
    unitAmount: 1490000, currency: 'usd', visual: 'accelerator', maxQuantity: 8,
    leadTime: `Pre-order · expected to ship ${PREORDER_SHIPPING}`, preOrder: true,
  },
  {
    id: 'flowforce-w-1100', route: '/systems/flowforce-w-1100', name: 'FlowForce W 1100 Workstation',
    description: 'Professional workstation with FPU Apollon processing and FPU 1100 acceleration for demanding local AI and engineering workflows.',
    unitAmount: 1290000, currency: 'usd', visual: 'server', maxQuantity: 8,
    leadTime: `Pre-order · expected to ship ${PREORDER_SHIPPING}`, preOrder: true,
  },
  {
    id: 'flowforce-e-1100', route: '/systems/flowforce-e-1100', name: 'FlowForce E 1100 Edge AI System',
    description: 'Compact edge AI system for local inference, computer vision, robotics, and intelligent infrastructure.',
    unitAmount: 390000, currency: 'usd', visual: 'server', maxQuantity: 12,
    leadTime: `Pre-order · expected to ship ${PREORDER_SHIPPING}`, preOrder: true,
  },
  {
    id: 'flowsystem-r-1100', route: '/systems/flowsystem-r-1100', name: 'FlowSystem R 1100 Enterprise Server',
    description: 'Accelerated enterprise compute node with FPU Apollon processors, FPU 1100 AI acceleration, and deployment support. Technical specifications: ???.',
    unitAmount: 8990000, currency: 'usd', visual: 'server', maxQuantity: 4,
    leadTime: `Pre-order · system builds start ${PREORDER_SHIPPING}`, preOrder: true,
  },
];

export const getCatalogItem = (id) => catalog.find((item) => item.id === id);
export const getCatalogItemByRoute = (route) => catalog.find((item) => item.route === route);
export const formatPrice = (amount, currency = 'usd') => new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase(), maximumFractionDigits: 0 }).format(amount / 100);
