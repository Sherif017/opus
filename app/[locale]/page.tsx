'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowRight, Check, Award, Users, Lightbulb } from 'lucide-react'

export default function HomePage() {
  const t = useTranslations('home')
  const [selectedTab, setSelectedTab] = useState('overview')

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/95 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 sm:w-10 h-9 sm:h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs sm:text-sm">OP</span>
            </div>
            <span className="font-bold text-lg sm:text-xl text-gray-900">OPUS</span>
          </Link>

          {/* Navigation Links - Hidden on mobile, visible on md+ */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              {t('footer.home')}
            </Link>
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              {t('footer.features')}
            </a>
            <a href="#about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              {t('footer.about')}
            </a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              {t('footer.pricing')}
            </a>
          </div>

          {/* Right side: Language Switcher + App Button */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Language Switcher */}
            <select 
              defaultValue="fr"
              onChange={() => {}}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>

            {/* App Button */}
            <Link href="/auth/login" className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm whitespace-nowrap">
              {t('footer.app')}
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden py-12 sm:py-16 md:py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-block mb-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 rounded-full">
              <span className="text-blue-600 font-semibold text-xs sm:text-sm">{t('hero.badge')}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              {t('hero.title')} <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{t('hero.titleHighlight')}</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-2">
              {t('hero.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16 px-2">
              <Link href="/auth/login">
                <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-sm sm:text-base md:text-lg shadow-lg">
                  {t('hero.cta_saas')}
                </button>
              </Link>

              <Link href="/consulting">
                <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors font-bold text-sm sm:text-base md:text-lg shadow-lg">
                  {t('hero.cta_consulting')}
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 text-center">
              <div className="bg-white/50 sm:bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600">100%</div>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">{t('stats.free')}</p>
              </div>
              <div className="bg-white/50 sm:bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600">97%</div>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">{t('stats.timeSaved')}</p>
              </div>
              <div className="bg-white/50 sm:bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600">2 sem</div>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">{t('stats.roi')}</p>
              </div>
              <div className="bg-white/50 sm:bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-600">500€+</div>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">{t('stats.consulting')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OPUS SAAS SECTION */}
      <section id="features" className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-gray-900 mb-3 sm:mb-4">
            {t('features.title')}
          </h2>
          <p className="text-center text-base sm:text-lg md:text-xl text-gray-600 mb-2 sm:mb-3 max-w-2xl mx-auto">
            {t('features.description')}
          </p>
          <p className="text-center text-xs sm:text-sm text-gray-500 mb-12 sm:mb-16 max-w-2xl mx-auto px-2">
            <span className="font-semibold text-gray-700">{t('features.saas_def')}</span>
            <span className="mx-2">•</span>
            <span className="font-semibold text-gray-700">{t('features.crm_def')}</span>
          </p>

          {/* FEATURES GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16">
            <div className="bg-white rounded-lg sm:rounded-xl p-6 sm:p-8 shadow-lg border-l-4 border-blue-600 hover:shadow-xl transition-shadow">
              <div className="text-3xl sm:text-4xl mb-4">📊</div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{t('features.quote.title')}</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">{t('features.quote.desc')}</p>
              <p className="text-xs sm:text-sm text-blue-600 font-semibold">Powered by AI ✨</p>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl p-6 sm:p-8 shadow-lg border-l-4 border-purple-600 hover:shadow-xl transition-shadow">
              <div className="text-3xl sm:text-4xl mb-4">🧠</div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{t('features.followup.title')}</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">{t('features.followup.desc')}</p>
              <p className="text-xs sm:text-sm text-purple-600 font-semibold">Powered by AI ✨</p>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl p-6 sm:p-8 shadow-lg border-l-4 border-green-600 hover:shadow-xl transition-shadow">
              <div className="text-3xl sm:text-4xl mb-4">⚡</div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{t('features.invoice.title')}</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">{t('features.invoice.desc')}</p>
              <p className="text-xs sm:text-sm text-green-600 font-semibold">100% Automatisé</p>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl p-6 sm:p-8 shadow-lg border-l-4 border-orange-600 hover:shadow-xl transition-shadow">
              <div className="text-3xl sm:text-4xl mb-4">👥</div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{t('features.clients.title')}</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">{t('features.clients.desc')}</p>
              <p className="text-xs sm:text-sm text-orange-600 font-semibold">Organisé & Accessible</p>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl p-6 sm:p-8 shadow-lg border-l-4 border-red-600 hover:shadow-xl transition-shadow">
              <div className="text-3xl sm:text-4xl mb-4">📈</div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{t('features.analytics.title')}</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">{t('features.analytics.desc')}</p>
              <p className="text-xs sm:text-sm text-red-600 font-semibold">Data-Driven</p>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl p-6 sm:p-8 shadow-lg border-l-4 border-pink-600 hover:shadow-xl transition-shadow">
              <div className="text-3xl sm:text-4xl mb-4">🔗</div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{t('features.integrations.title')}</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">{t('features.integrations.desc')}</p>
              <p className="text-xs sm:text-sm text-pink-600 font-semibold">Connexions Illimitées</p>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl p-6 sm:p-8 shadow-lg border-l-4 border-cyan-600 hover:shadow-xl transition-shadow col-span-1 sm:col-span-2 lg:col-span-3">
              <div className="text-3xl sm:text-4xl mb-4">🎯</div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{t('features.crm.title')}</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">{t('features.crm.desc')}</p>
              <p className="text-xs sm:text-sm text-cyan-600 font-semibold">Powered by CRM ✨</p>
            </div>
          </div>

          {/* MAIN CTA SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl p-8 sm:p-12 text-white shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 sm:w-12 h-10 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center text-white text-xl sm:text-2xl">
                    🚀
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold">OPUS SaaS</h3>
                </div>

                <p className="text-sm sm:text-base text-white/90 mb-6 sm:mb-8 leading-relaxed">
                  {t('features.perfect_for')}
                </p>

                <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Créez vos premiers devis gratuitement</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Pas de limite. Pas de surprises.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Propulsé par l'IA</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Support complet</span>
                  </div>
                </div>

                <div className="bg-white/10 rounded-lg sm:rounded-xl p-4 mb-6 sm:mb-8 border border-white/20">
                  <p className="text-xl sm:text-2xl font-bold">Gratuit 🎉</p>
                  <p className="text-xs sm:text-sm text-white/80">Phase de test - tous les retours sont bienvenus</p>
                </div>

                <Link href="/dashboard">
                  <button className="w-full px-6 py-3 sm:py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-bold text-sm sm:text-base md:text-lg shadow-lg">
                    Essayer maintenant →
                  </button>
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">{t('features.perfect_for')}</h3>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-400 transition-colors">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">
                    ✓
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">{t('features.artisans')}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{t('features.artisans_desc')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200 hover:border-purple-400 transition-colors">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">
                    ✓
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">{t('features.sme')}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{t('features.sme_desc')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200 hover:border-green-400 transition-colors">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">
                    ✓
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">{t('features.entrepreneurs')}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{t('features.entrepreneurs_desc')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg border border-orange-200 hover:border-orange-400 transition-colors">
                  <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">
                    ✓
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">{t('features.you')}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{t('features.you_desc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CASE STUDIES */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-gray-900 mb-3 sm:mb-4">
            {t('caseStudies.title')}
          </h2>
          <p className="text-center text-base sm:text-lg md:text-xl text-gray-600 mb-12 sm:mb-16 max-w-2xl mx-auto">
            {t('caseStudies.description')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <Link href="/consulting/case-1">
              <div className="bg-white rounded-lg sm:rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all cursor-pointer h-full">
                <div className="text-4xl sm:text-5xl mb-4">📊</div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  {t('caseStudies.case1_company')}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  {t('caseStudies.case1_desc')}
                </p>
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg mb-4">
                  <p className="font-bold text-blue-600 text-base sm:text-lg">{t('caseStudies.case1_savings')}</p>
                  <p className="text-xs sm:text-sm text-gray-600">{t('caseStudies.case1_time')}</p>
                </div>
                <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
                  {t('caseStudies.readCase')} <ArrowRight size={18} />
                </div>
              </div>
            </Link>

            <Link href="/consulting/case-2">
              <div className="bg-white rounded-lg sm:rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all cursor-pointer h-full">
                <div className="text-4xl sm:text-5xl mb-4">⚡</div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  {t('caseStudies.case2_company')}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  {t('caseStudies.case2_desc')}
                </p>
                <div className="bg-orange-50 p-3 sm:p-4 rounded-lg mb-4">
                  <p className="font-bold text-orange-600 text-base sm:text-lg">{t('caseStudies.case2_revenue')}</p>
                  <p className="text-xs sm:text-sm text-gray-600">{t('caseStudies.case2_impact')}</p>
                </div>
                <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
                  {t('caseStudies.readCase')} <ArrowRight size={18} />
                </div>
              </div>
            </Link>

            <Link href="/consulting/case-3">
              <div className="bg-white rounded-lg sm:rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all cursor-pointer h-full">
                <div className="text-4xl sm:text-5xl mb-4">🏠</div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  {t('caseStudies.case3_company')}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  {t('caseStudies.case3_desc')}
                </p>
                <div className="bg-green-50 p-3 sm:p-4 rounded-lg mb-4">
                  <p className="font-bold text-green-600 text-base sm:text-lg">{t('caseStudies.case3_benefit')}</p>
                  <p className="text-xs sm:text-sm text-gray-600">{t('caseStudies.case3_impact')}</p>
                </div>
                <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
                  {t('caseStudies.readCase')} <ArrowRight size={18} />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* À PROPOS / TEAM SECTION */}
      <section id="about" className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-block mb-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 rounded-full">
              <span className="text-blue-600 font-semibold text-xs sm:text-sm">{t('about.badge')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              {t('about.title')}
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {t('about.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
            <div className="bg-white rounded-lg sm:rounded-xl p-6 sm:p-8 shadow-lg border-l-4 border-blue-600">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <Lightbulb className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{t('about.innovation.title')}</h3>
              <p className="text-sm sm:text-base text-gray-600">
                {t('about.innovation.desc')}
              </p>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl p-6 sm:p-8 shadow-lg border-l-4 border-purple-600">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{t('about.quality.title')}</h3>
              <p className="text-sm sm:text-base text-gray-600">
                {t('about.quality.desc')}
              </p>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl p-6 sm:p-8 shadow-lg border-l-4 border-green-600">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{t('about.ux.title')}</h3>
              <p className="text-sm sm:text-base text-gray-600">
                {t('about.ux.desc')}
              </p>
            </div>
          </div>

          {/* School Badge */}
          <div className="bg-white rounded-lg sm:rounded-xl p-8 sm:p-12 shadow-xl border-2 border-blue-200 text-center">
            <div className="mb-6">
              <div className="inline-block p-3 bg-blue-50 rounded-lg mb-4">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              {t('about.school')}
            </h3>
            <p className="text-base sm:text-lg text-gray-600 mb-4 max-w-2xl mx-auto">
              {t('about.school_desc')}
            </p>
            <p className="text-sm sm:text-base text-blue-600 font-semibold">
              {t('about.school_values')}
            </p>
          </div>

          {/* Why it matters */}
          <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-blue-50 p-6 sm:p-8 rounded-lg sm:rounded-xl border border-blue-200">
              <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{t('about.whyMatter')}</h4>
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span className="text-sm sm:text-base text-gray-700"><strong>{t('about.expertise')}</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span className="text-sm sm:text-base text-gray-700"><strong>{t('about.architecture')}</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span className="text-sm sm:text-base text-gray-700"><strong>{t('about.security')}</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span className="text-sm sm:text-base text-gray-700"><strong>{t('about.innovation_cont')}</strong></span>
                </li>
              </ul>
            </div>

            <div className="bg-purple-50 p-6 sm:p-8 rounded-lg sm:rounded-xl border border-purple-200">
              <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{t('about.yourGuarantee')}</h4>
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span className="text-sm sm:text-base text-gray-700"><strong>{t('about.reliability')}</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span className="text-sm sm:text-base text-gray-700"><strong>{t('about.support')}</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span className="text-sm sm:text-base text-gray-700"><strong>{t('about.roadmap')}</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span className="text-sm sm:text-base text-gray-700"><strong>{t('about.transparency')}</strong></span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CONSULTING SECTION */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-gray-900 mb-12 sm:mb-16">
            {t('consulting.title')}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg sm:rounded-2xl p-8 sm:p-12 border-2 border-green-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-green-600 rounded-lg flex items-center justify-center text-white text-xl sm:text-2xl">
                  🚀
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('consulting.opus_consulting')}</h3>
              </div>

              <p className="text-sm sm:text-base md:text-lg text-gray-700 mb-6 sm:mb-8 leading-relaxed">
                {t('consulting.consulting_desc')}
              </p>

              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <div className="flex items-start gap-3">
                  <Check className="w-5 sm:w-6 h-5 sm:h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">{t('consulting.free_audit')}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{t('consulting.audit_desc')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Check className="w-5 sm:w-6 h-5 sm:h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">{t('consulting.custom_automation')}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{t('consulting.automation_desc')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Check className="w-5 sm:w-6 h-5 sm:h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">{t('consulting.integration')}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{t('consulting.integration_desc')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Check className="w-5 sm:w-6 h-5 sm:h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">{t('consulting.training')}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{t('consulting.training_desc')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Check className="w-5 sm:w-6 h-5 sm:h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">{t('consulting.roi_guarantee')}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{t('consulting.roi_desc')}</p>
                  </div>
                </div>
              </div>

              <Link href="/consulting">
                <button className="w-full px-6 py-3 sm:py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold text-sm sm:text-base md:text-lg">
                  {t('consulting.book_audit')}
                </button>
              </Link>
            </div>

            <div className="space-y-8 sm:space-y-8">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">{t('consulting.for_who')}</h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-7 sm:w-8 h-7 sm:h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold flex-shrink-0 text-xs">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">{t('consulting.artisans')}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{t('consulting.artisans_desc')}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 sm:w-8 h-7 sm:h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold flex-shrink-0 text-xs">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">{t('consulting.sme')}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{t('consulting.sme_desc')}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 sm:w-8 h-7 sm:h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold flex-shrink-0 text-xs">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">{t('consulting.any_company')}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{t('consulting.any_company_desc')}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">{t('consulting.process')}</h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-7 sm:w-8 h-7 sm:h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-xs">
                      1
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">{t('consulting.step1')}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{t('consulting.step1_desc')}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-7 sm:w-8 h-7 sm:h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-xs">
                      2
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">{t('consulting.step2')}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{t('consulting.step2_desc')}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-7 sm:w-8 h-7 sm:h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-xs">
                      3
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">{t('consulting.step3')}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{t('consulting.step3_desc')}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-7 sm:w-8 h-7 sm:h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-xs">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">{t('consulting.step4')}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{t('consulting.step4_desc')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-gray-900 mb-12 sm:mb-16">
            {t('pricing.title')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto">
            <div className="bg-white rounded-lg sm:rounded-xl p-6 sm:p-8 shadow-lg">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{t('pricing.saas')}</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-6">{t('pricing.saas_desc')}</p>

              <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-6">{t('pricing.saas_price')}</div>

              <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
                {t('pricing.saas_info')}
              </p>

              <Link href="/auth/login">
                <button className="w-full px-6 py-3 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-sm sm:text-base">
                  {t('pricing.saas_cta')}
                </button>
              </Link>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-6 sm:p-8 shadow-lg border-2 border-green-200">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{t('pricing.consulting_title')}</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-6">{t('pricing.consulting_desc')}</p>

              <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-6">{t('pricing.consulting_price')}</div>

              <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
                {t('pricing.consulting_info')}
              </p>

              <Link href="/consulting">
                <button className="w-full px-6 py-3 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold text-sm sm:text-base">
                  {t('pricing.consulting_cta')}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINALE */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            {t('cta_final.title')}
          </h2>

          <p className="text-base sm:text-lg md:text-xl mb-8 sm:mb-12 opacity-90 leading-relaxed">
            {t('cta_final.description')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/auth/login">
              <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-bold text-sm sm:text-base md:text-lg">
                {t('cta_final.cta_saas')}
              </button>
            </Link>

            <Link href="/consulting">
              <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors font-bold text-sm sm:text-base md:text-lg border-2 border-white">
                {t('cta_final.cta_consulting')}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div>
              <h4 className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">{t('footer.opus')}</h4>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <li><Link href="/" className="hover:text-white transition-colors">{t('footer.home')}</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">{t('footer.app')}</Link></li>
                <li><Link href="/consulting" className="hover:text-white transition-colors">{t('footer.consulting')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">{t('footer.product')}</h4>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">{t('footer.features')}</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">{t('footer.about')}</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">{t('footer.pricing')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">{t('footer.consulting')}</h4>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <li><Link href="/consulting" className="hover:text-white transition-colors">{t('footer.services')}</Link></li>
                <li><Link href="/consulting/booking" className="hover:text-white transition-colors">{t('footer.book_audit')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">{t('footer.legal')}</h4>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.terms')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 sm:pt-8 text-center">
            <p className="text-xs sm:text-sm">{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}