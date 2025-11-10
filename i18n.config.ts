import { getRequestConfig } from 'next-intl/server';

export const defaultLocale = 'fr';
export const locales = ['fr', 'en'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Vérifie que la locale est valide
  if (!locale || (locale !== 'fr' && locale !== 'en')) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});