'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Check } from 'lucide-react'

export default function ConsultingPage() {
  const t = useTranslations('consultingPage')

  const caseStudies = [
    {
      id: 1,
      icon: "📊",
      color: "from-blue-600 to-blue-700",
    },
    {
      id: 2,
      icon: "⚡",
      color: "from-orange-600 to-orange-700",
    },
    {
      id: 3,
      icon: "🏠",
      color: "from-green-600 to-green-700",
    },
  ]

  const features = [
    { icon: '✅', titleKey: 'features.feature1_title', descKey: 'features.feature1_desc' },
    { icon: '⚡', titleKey: 'features.feature2_title', descKey: 'features.feature2_desc' },
    { icon: '📈', titleKey: 'features.feature3_title', descKey: 'features.feature3_desc' },
    { icon: '🤝', titleKey: 'features.feature4_title', descKey: 'features.feature4_desc' },
  ]

  const getCaseStudyText = (caseId: number, field: string): string => {
    return t(`case_studies.case${caseId}_${field}`)
  }

  const getPricingText = (planNum: number, field: string): string => {
    return t(`pricing.plan${planNum}_${field}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            OPUS
          </Link>
          <Link href="/dashboard" className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 transition-colors hidden sm:block">
            Dashboard
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 text-center">
        <div className="mb-6 sm:mb-8">
          <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs sm:text-sm font-semibold">
            {t('badge')}
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
          {t('hero_title')} <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">{t('hero_highlight')}</span> {t('hero_subtitle')}
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
          {t('hero_description')}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16">
          <Link href="/consulting/booking">
            <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-bold text-sm sm:text-base md:text-lg transition-all shadow-lg hover:shadow-xl">
              {t('cta_audit')}
            </button>
          </Link>
          <a href="#case-studies" className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-sm sm:text-base md:text-lg transition-all">
            {t('cta_cases')}
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-slate-800/50 p-3 sm:p-4 rounded-lg border border-slate-700">
            <div className="text-2xl sm:text-3xl font-bold text-blue-400">3</div>
            <div className="text-xs sm:text-sm text-slate-300 mt-1">{t('stats_cases')}</div>
          </div>
          <div className="bg-slate-800/50 p-3 sm:p-4 rounded-lg border border-slate-700">
            <div className="text-2xl sm:text-3xl font-bold text-green-400">141k€</div>
            <div className="text-xs sm:text-sm text-slate-300 mt-1">{t('stats_benefit')}</div>
          </div>
          <div className="bg-slate-800/50 p-3 sm:p-4 rounded-lg border border-slate-700">
            <div className="text-2xl sm:text-3xl font-bold text-orange-400">2 sem</div>
            <div className="text-xs sm:text-sm text-slate-300 mt-1">{t('stats_roi')}</div>
          </div>
          <div className="bg-slate-800/50 p-3 sm:p-4 rounded-lg border border-slate-700">
            <div className="text-2xl sm:text-3xl font-bold text-purple-400">99%</div>
            <div className="text-xs sm:text-sm text-slate-300 mt-1">{t('stats_satisfaction')}</div>
          </div>
        </div>
      </section>

      {/* CASE STUDIES SECTION */}
      <section id="case-studies" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-white mb-12 sm:mb-16">
          {t('section_achievements')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {caseStudies.map((study) => (
            <Link key={study.id} href={`/consulting/case-${study.id}`}>
              <div className="group cursor-pointer h-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-slate-600 rounded-lg sm:rounded-xl overflow-hidden transition-all hover:shadow-xl">
                <div className={`bg-gradient-to-r ${study.color} p-6 sm:p-8 h-24 sm:h-32 flex items-center justify-center text-4xl sm:text-5xl group-hover:scale-110 transition-transform`}>
                  {study.icon}
                </div>

                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{getCaseStudyText(study.id, 'title')}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 mb-4">{getCaseStudyText(study.id, 'subtitle')}</p>

                  <div className="bg-slate-700/50 p-2 sm:p-3 rounded mb-4 border-l-4 border-blue-400">
                    <p className="text-xs sm:text-sm font-semibold text-blue-300">{getCaseStudyText(study.id, 'stat')}</p>
                  </div>

                  <span className="inline-block px-2 sm:px-3 py-1 bg-slate-700 text-slate-300 text-xs rounded-full">
                    {getCaseStudyText(study.id, 'sector')}
                  </span>
                </div>

                <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2">
                  <div className="text-blue-400 text-xs sm:text-sm font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                    {t('case_studies.read_case')}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-white mb-12 sm:mb-16">
          {t('section_process')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, i) => (
            <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 sm:p-6 hover:border-blue-400/50 transition-colors">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{feature.icon}</div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">{t(feature.titleKey)}</h3>
              <p className="text-xs sm:text-sm text-slate-400">{t(feature.descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-white mb-12 sm:mb-16">
          {t('section_pricing')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {[1, 2, 3].map((planNum) => {
            const highlight = planNum === 2
            return (
              <Link key={planNum} href="/consulting/booking">
                <div
                  className={`rounded-lg p-6 sm:p-8 border transition-all cursor-pointer ${
                    highlight
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500 ring-2 ring-blue-400 transform scale-100 sm:scale-105'
                      : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <h3 className={`text-lg sm:text-2xl font-bold mb-2 ${highlight ? 'text-white' : 'text-white'}`}>
                    {getPricingText(planNum, 'name')}
                  </h3>
                  <div className={`text-2xl sm:text-4xl font-bold mb-2 ${highlight ? 'text-white' : 'text-blue-400'}`}>
                    {getPricingText(planNum, 'price')}
                  </div>
                  <p className={`text-xs sm:text-sm mb-6 ${highlight ? 'text-blue-100' : 'text-slate-400'}`}>
                    {getPricingText(planNum, 'duration')}
                  </p>

                  <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                    {[1, 2, 3].map((featureNum) => (
                      <li key={featureNum} className={`flex items-center gap-2 text-xs sm:text-sm ${highlight ? 'text-white' : 'text-slate-300'}`}>
                        <Check size={16} className={highlight ? 'text-white' : 'text-blue-400'} />
                        <span>{getPricingText(planNum, `feature${featureNum}`)}</span>
                      </li>
                    ))}
                  </ul>

                  <button className={`w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-bold transition-all text-xs sm:text-sm ${
                    highlight
                      ? 'bg-white text-blue-600 hover:bg-blue-50'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}>
                    {planNum === 1 ? t('cta_audit') : t('pricing.cta_start')}
                  </button>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* CTA SECTION */}
      <section id="audit" className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg sm:rounded-2xl p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
            {t('cta_section.title')}
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-blue-100 mb-6 sm:mb-8 leading-relaxed">
            {t('cta_section.description')}
          </p>

          <div className="mb-6 sm:mb-8">
            <div className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-white/20 border border-white/30 rounded text-white text-xs sm:text-sm font-semibold backdrop-blur-sm">
              {t('cta_section.guarantee')}
            </div>
          </div>

          <Link href="/consulting/booking">
            <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 rounded-lg font-bold text-sm sm:text-base md:text-lg hover:bg-blue-50 transition-colors shadow-lg">
              {t('cta_section.cta_button')}
            </button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-700 py-8 sm:py-12 mt-12 sm:mt-16 md:mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400 text-xs sm:text-sm">
          <p>{t('footer')}</p>
        </div>
      </footer>
    </div>
  )
}