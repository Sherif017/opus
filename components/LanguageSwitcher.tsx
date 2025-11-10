'use client';

import { useLocale } from 'next-intl';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const locale = useLocale();

  const handleLanguageChange = (newLocale: string) => {
    // Toujours ajouter la locale à l'URL
    window.location.href = `/${newLocale}/`;
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4" />
      <select
        value={locale}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 cursor-pointer"
      >
        <option value="fr">Français</option>
        <option value="en">English</option>
      </select>
    </div>
  );
}