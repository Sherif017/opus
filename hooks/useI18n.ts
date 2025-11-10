// hooks/useI18n.ts
'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useMemo } from 'react';
import type { Locale } from '@/i18n.config';
import {
  translateProspectStatus,
  translateInvoiceStatus,
  translateQuoteStatus,
  translateAppointmentStatus,
  translateAppointmentType,
} from '@/utils/translations';

/**
 * Hook personnalisé pour accéder facilement aux traductions et locale
 * Combine les traductions UI et les traductions de données
 */
export function useI18n() {
  const t = useTranslations();
  const locale = useLocale() as Locale;

  return useMemo(
    () => ({
      // Traductions UI
      t,
      locale,

      // Traductions de statuts
      prospectStatus: (status: string) => translateProspectStatus(status, locale),
      invoiceStatus: (status: string) => translateInvoiceStatus(status, locale),
      quoteStatus: (status: string) => translateQuoteStatus(status, locale),
      appointmentStatus: (status: string) => translateAppointmentStatus(status, locale),
      appointmentType: (type: string) => translateAppointmentType(type, locale),

      // Utilitaires
      currency: locale === 'fr' ? '€' : '$',
      isEnglish: locale === 'en',
      isFrench: locale === 'fr',

      // Format date simple
      formatDate: (date: Date | string) => {
        const d = typeof date === 'string' ? new Date(date) : date;
        return new Intl.DateTimeFormat(locale).format(d);
      },

      // Format number comme devise
      formatCurrency: (amount: number) => {
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: locale === 'fr' ? 'EUR' : 'USD',
        }).format(amount);
      },
    }),
    [t, locale]
  );
}