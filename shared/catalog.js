export const PREORDER_SHIPPING = 'Q1 2027';

export const catalog = [
  { sku: 'FPU-APOLLON-1100', route: '/products/fpu-apollon-1100', name: 'FPU Apollon 1100 Server Processor', description: 'Server processor · technical specifications: ??? · production pre-order', priceCents: 890000, visual: 'processor', leadTime: `Pre-order · expected to ship ${PREORDER_SHIPPING}` },
  { sku: 'FPU-1100', route: '/products/fpu-1100', name: 'FPU 1100 AI Accelerator', description: 'Flow Processing Unit · technical specifications: ??? · production pre-order', priceCents: 1490000, visual: 'accelerator', leadTime: `Pre-order · expected to ship ${PREORDER_SHIPPING}` },
  { sku: 'FPU-FORCE-1100', route: '/products/fpu-force-1100', name: 'FPU Force 1100 Server GPU', description: 'Server graphics · visualization · production pre-order', priceCents: 1490000, visual: 'accelerator', leadTime: `Pre-order · expected to ship ${PREORDER_SHIPPING}` },
  { sku: 'FLOWFORCE-W-1100', route: '/systems/flowforce-w-1100', name: 'FlowForce W 1100 Workstation', description: 'Professional AI and engineering workstation', priceCents: 1290000, visual: 'server', leadTime: `Pre-order · expected to ship ${PREORDER_SHIPPING}` },
  { sku: 'FLOWFORCE-E-1100', route: '/systems/flowforce-e-1100', name: 'FlowForce E 1100 Edge AI System', description: 'Compact edge AI · local inference · computer vision', priceCents: 390000, visual: 'server', leadTime: `Pre-order · expected to ship ${PREORDER_SHIPPING}` },
  { sku: 'FLOWSYSTEM-R-1100', route: '/systems/flowsystem-r-1100', name: 'FlowSystem R 1100 Enterprise Server', description: 'Accelerated enterprise server · technical specifications: ???', priceCents: 12990000, visual: 'server', leadTime: `Pre-order · system builds start ${PREORDER_SHIPPING}` },
];

export const productSkuByRoute = Object.fromEntries(catalog.map((product) => [product.route, product.sku]));

export function getCatalogItem(sku) {
  return catalog.find((product) => product.sku === sku);
}

export function validateCart(items) {
  if (!Array.isArray(items) || !items.length || items.length > 20) throw new Error('Your cart is empty or contains too many line items.');
  return items.map((item) => {
    const product = getCatalogItem(item?.sku);
    const quantity = Number(item?.quantity);
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw new Error('The cart contains an invalid product or quantity.');
    return { ...product, quantity, lineTotalCents: product.priceCents * quantity };
  });
}
