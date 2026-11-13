import App from '../../src/App.jsx';
import { pages } from '../../src/siteData.js';
import { legalDocuments } from '../../src/legalData.js';

const privateRoutes = ['/login', '/account', '/store'];

function routeFromParams(params) {
  return `/${(params.slug || []).join('/')}`.replace(/\/+$/, '') || '/';
}

export function generateStaticParams() {
  const routes = [
    ...Object.keys(pages),
    ...Object.keys(legalDocuments),
    '/legal', '/store', '/login', '/account', '/support/downloads',
  ];
  return [
    { slug: [] },
    ...[...new Set(routes)].map((route) => ({ slug: route.slice(1).split('/') })),
  ];
}

export async function generateMetadata({ params }) {
  const route = routeFromParams(await params);
  const page = pages[route];
  const legalPage = legalDocuments[route];
  const title = route === '/' ? 'Mindpick — Compute Without Limits'
    : page?.title || legalPage?.title
      || (route === '/legal' ? 'Legal & Compliance'
        : route === '/store' ? 'Store'
          : route.startsWith('/checkout/') ? 'Secure Checkout'
            : route.startsWith('/order/') ? 'Order Status'
              : route === '/account' ? 'My Account'
                : route === '/login' ? 'Sign In' : 'Page Not Found');
  const description = page?.description || legalPage?.summary || 'Mindpick builds high-performance processors, AI accelerators, and rack-scale systems for AI, cloud, HPC, and data analytics.';
  const noindex = privateRoutes.includes(route) || route.startsWith('/checkout/') || route.startsWith('/order/');
  return {
    title: route === '/' ? { absolute: 'Mindpick — Compute Without Limits' } : title,
    description,
    alternates: { canonical: route },
    robots: { index: !noindex, follow: !noindex },
    openGraph: { title, description, url: route },
  };
}

export default function Page() {
  return <App />;
}
