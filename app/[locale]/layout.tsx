import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { AuthProvider } from "../[locale]/providers/auth-provider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { notFound } from "next/navigation";
import { routing } from "@/lib/routing";
import type { Locale } from "@/i18n.config";
import { NextIntlClientProvider } from 'next-intl';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OPUS",
  description: "Plateforme de consulting OPUS",
};

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export default async function RootLayout({
  children,
  params,
}: Readonly<LocaleLayoutProps>) {
  const { locale } = await params;

  // Valider que la locale est supportée
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  // ✅ Import direct des messages
  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AuthProvider>
            <main>
              {children}
            </main>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}