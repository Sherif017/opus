import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'always',
  pathnames: {
    '/': '/',
    '/dashboard': {
      fr: '/tableau-de-bord',
      en: '/dashboard',
    },
    '/clients': '/clients',
    '/prospects': '/prospects',
    '/factures': {
      fr: '/factures',
      en: '/invoices',
    },
    '/devis': {
      fr: '/devis',
      en: '/quotes',
    },
    '/appointments': {
      fr: '/rendez-vous',
      en: '/appointments',
    },
    '/relances': {
      fr: '/relances',
      en: '/follow-ups',
    },
  },
});