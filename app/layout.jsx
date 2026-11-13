import '../src/styles.css';
import '../src/kilo.css';

export const metadata = {
  metadataBase: new URL(process.env.PUBLIC_URL || 'https://mindpick.com'),
  title: {
    default: 'Mindpick — Compute Without Limits',
    template: '%s | Mindpick',
  },
  description: 'Mindpick builds high-performance processors, AI accelerators, and rack-scale systems for AI, cloud, HPC, and data analytics.',
  icons: {
    icon: '/favicon-64.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Mindpick — Compute Without Limits',
    description: 'High-performance processors, AI accelerators, and rack-scale server systems for AI, cloud, HPC, and data analytics.',
    url: '/',
    siteName: 'Mindpick',
    images: ['/logo.png'],
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

const themeScript = `try{document.documentElement.dataset.theme=localStorage.getItem('gc-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch{document.documentElement.dataset.theme='dark'}`;
const organizationJson = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Mindpick',
  url: 'https://mindpick.com/',
  logo: 'https://mindpick.com/logo.png',
  description: 'High-performance processors, AI accelerators, and rack-scale server systems for AI, cloud, HPC, and data analytics.',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: organizationJson }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
