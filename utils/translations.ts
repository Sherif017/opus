// utils/translations.ts
import { Locale } from '@/i18n.config';

/**
 * Mapping des statuts pour les prospects
 */
export const prospectStatusTranslations: Record<string, Record<Locale, string>> = {
  'nouveau': {
    fr: 'Nouveau',
    en: 'New',
  },
  'contacté': {
    fr: 'Contacté',
    en: 'Contacted',
  },
  'intéressé': {
    fr: 'Intéressé',
    en: 'Interested',
  },
  'devis_envoyé': {
    fr: 'Devis envoyé',
    en: 'Quote sent',
  },
  'négociation': {
    fr: 'Négociation',
    en: 'Negotiation',
  },
  'gagné': {
    fr: 'Gagné',
    en: 'Won',
  },
  'perdu': {
    fr: 'Perdu',
    en: 'Lost',
  },
};

/**
 * Mapping des statuts pour les factures
 */
export const invoiceStatusTranslations: Record<string, Record<Locale, string>> = {
  'brouillon': {
    fr: 'Brouillon',
    en: 'Draft',
  },
  'envoyée': {
    fr: 'Envoyée',
    en: 'Sent',
  },
  'payée': {
    fr: 'Payée',
    en: 'Paid',
  },
  'retard': {
    fr: 'En retard',
    en: 'Overdue',
  },
  'annulée': {
    fr: 'Annulée',
    en: 'Cancelled',
  },
};

/**
 * Mapping des statuts pour les devis
 */
export const quoteStatusTranslations: Record<string, Record<Locale, string>> = {
  'brouillon': {
    fr: 'Brouillon',
    en: 'Draft',
  },
  'envoyé': {
    fr: 'Envoyé',
    en: 'Sent',
  },
  'accepté': {
    fr: 'Accepté',
    en: 'Accepted',
  },
  'refusé': {
    fr: 'Refusé',
    en: 'Declined',
  },
  'expiré': {
    fr: 'Expiré',
    en: 'Expired',
  },
};

/**
 * Mapping des statuts pour les rendez-vous
 */
export const appointmentStatusTranslations: Record<string, Record<Locale, string>> = {
  'planifié': {
    fr: 'Planifié',
    en: 'Scheduled',
  },
  'confirmé': {
    fr: 'Confirmé',
    en: 'Confirmed',
  },
  'complété': {
    fr: 'Complété',
    en: 'Completed',
  },
  'annulé': {
    fr: 'Annulé',
    en: 'Cancelled',
  },
};

/**
 * Fonction générique pour traduire un statut
 */
export function translateStatus(
  status: string,
  locale: Locale,
  translations: Record<string, Record<Locale, string>>
): string {
  return translations[status]?.[locale] ?? status;
}

/**
 * Fonction pour traduire un statut de prospect
 */
export function translateProspectStatus(status: string, locale: Locale): string {
  return translateStatus(status, locale, prospectStatusTranslations);
}

/**
 * Fonction pour traduire un statut de facture
 */
export function translateInvoiceStatus(status: string, locale: Locale): string {
  return translateStatus(status, locale, invoiceStatusTranslations);
}

/**
 * Fonction pour traduire un statut de devis
 */
export function translateQuoteStatus(status: string, locale: Locale): string {
  return translateStatus(status, locale, quoteStatusTranslations);
}

/**
 * Fonction pour traduire un statut de rendez-vous
 */
export function translateAppointmentStatus(status: string, locale: Locale): string {
  return translateStatus(status, locale, appointmentStatusTranslations);
}

/**
 * Types de service/rendez-vous
 */
export const appointmentTypeTranslations: Record<string, Record<Locale, string>> = {
  'consultation': {
    fr: 'Consultation',
    en: 'Consultation',
  },
  'visite': {
    fr: 'Visite',
    en: 'Visit',
  },
  'intervention': {
    fr: 'Intervention',
    en: 'Service call',
  },
  'suivi': {
    fr: 'Suivi',
    en: 'Follow-up',
  },
  'devis': {
    fr: 'Devis',
    en: 'Quote',
  },
};

export function translateAppointmentType(type: string, locale: Locale): string {
  return translateStatus(type, locale, appointmentTypeTranslations);
}