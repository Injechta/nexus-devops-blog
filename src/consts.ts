// Site Configuration
// Centralized configuration for site metadata, SEO, and branding

export const SITE_TITLE = 'Nexus DevOps | La Forge Devops'
export const SITE_DESCRIPTION =
  'Bienvenue sur le blog  dédié à la culture DevOps. Progressons ensemble.'

export const GITHUB_URL = 'https://github.com/GregoryElBajoury'
export const SITE_URL = 'https://shadcnstudio.com/'

export const SITE_METADATA = {
  title: {
    default: 'Nexus DevOps | La Forge Devops'
  },
  description:
    'La forge de Nexus DevOps, des articles, des tutoriels et des labs  sur les pilliers du DevOps.',
  keywords: [
    'DevOps',
    'DevSecOps',
    'Cybersécurité',
    'Linux',
    'Bash',
    'Infrastructure As Code',
    'Audit',
    'Terraform',
    'Ansible',
    'Kubernetes',
    'Docker',
    'github',
    'CI CD',
    'Nexus DevOps',
    'Scripting',
    'Monitoring',
    'Automatisation',
    'Cloud',
    'Observabilité'
  ],
  authors: [{ name: 'Gregory EL BAJOURY', url: SITE_URL }],
  creator: 'Gregory EL BAJOURY',
  publisher: 'Gregory EL BAJOURY',
  robots: {
    index: true,
    follow: true
  },
  language: 'fr-FR',
  locale: 'fr_FR',
  icons: {
    icon: [
      { url: '/logomini.png', sizes: '48x48' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [{ url: '/favicon/apple-touch-icon.png', sizes: '180x180' }],
    shortcut: [{ url: '/logomini.png' }]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@ton_twitter',
    creator: '@ton_twitter',
    title: 'Nexus DevOps',
    description: 'Analyses de sécurité et DevOps.',
    images: ['/moi.jpg']
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Nexus DevOps',
    title: 'Nexus DevOps | La Forge Devops',
    description:
      'La forge de Nexus DevOps, des articles, des tutoriels et des labs  sur les pilliers du DevOps.',
    images: [
      {
        url: '/moi.jpeg',
        width: 1200,
        height: 630,
        alt: 'Nexus DevOps',
        type: 'image/jpeg'
      }
    ]
  },
  verification: {
    google: '', // Add your Google verification code
    yandex: '', // Add your Yandex verification code
    bing: '' // Add your Bing verification code
  }
}

// Social media links
export const SOCIAL_LINKS = {
  github: GITHUB_URL,
  twitter: 'https://x.com/JechtMast',
  discord: '',
  linkedin: 'https://www.linkedin.com/in/gregory-elbajoury/'
}

// Company information for structured data
export const COMPANY_INFO = {
  name: 'Nexus DevOps',
  legalName: 'Nexus DevOps',
  url: SITE_URL,
  logo: `/logomini.png`,
  foundingDate: '2026',
  address: {
    streetAddress: '',
    addressLocality: 'Toulouse',
    addressRegion: 'Occitanie',
    postalCode: '31000',
    addressCountry: 'FR'
  },
  contactPoint: {
    telephone: '',
    contactType: 'technical support',
    email: 'gregory.elbajoury@nexus-devops.fr'
  },
  sameAs: Object.values(SOCIAL_LINKS).filter(link => link !== '')
}
