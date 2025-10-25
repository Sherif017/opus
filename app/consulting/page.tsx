'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, FileText, Check, Calendar } from 'lucide-react'

export default function ConsultingPage() {
  const caseStudies = [
    {
      id: 1,
      title: "Triangle-Bois: 70,200€ économisés/an",
      subtitle: "Automatisation bilan social 30 employés",
      stat: "120h → 3h/mois (-97%)",
      sector: "Menuiserie",
      color: "from-blue-600 to-blue-700",
      icon: "📊",
    },
    {
      id: 2,
      title: "Jean (Électricien): 111,360€ revenue",
      subtitle: "Devis/Factures/Relances automatisés",
      stat: "+25% conversion, 97% gain temps",
      sector: "Artisan",
      color: "from-orange-600 to-orange-700",
      icon: "⚡",
    },
    {
      id: 3,
      title: "Agence Laurent: 141,600€ bénéfice",
      subtitle: "CRM centralisé + Automations",
      stat: "80% moins d'admin, +40% conversion",
      sector: "Immobilier",
      color: "from-green-600 to-green-700",
      icon: "🏠",
    },
  ]

  const features = [
    { icon: '✅', title: 'Audit gratuit', desc: '30 min pour identifier vos gains' },
    { icon: '⚡', title: 'Implémentation rapide', desc: '2-4 semaines de mise en place' },
    { icon: '📈', title: 'ROI garanti', desc: 'Vous gagnez en 2-3 mois minimum' },
    { icon: '🤝', title: 'Support complet', desc: 'Formation + maintenance incluses' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            OPUS
          </Link>
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 transition-colors">
            Dashboard
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="mb-6">
          <span className="inline-block px-4 py-2 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-sm font-semibold">
            🎯 Audit Gratuit
          </span>
        </div>

        <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Gagnez <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">10-50h/semaine</span> en automatisant votre admin
        </h1>

        <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto">
          Nous aidons les artisans et PME à automatiser leurs tâches répétitives. 
          En moyenne: <strong>+100k€ revenue</strong> ou <strong>70k€ temps économisé</strong> par an.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/consulting/booking">
            <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl">
              Réserver audit gratuit →
            </button>
          </Link>
          <a href="#case-studies" className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-lg transition-all">
            Voir nos cas d'études
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <div className="text-3xl font-bold text-blue-400">3</div>
            <div className="text-slate-300 text-sm">Cas d'études réels</div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <div className="text-3xl font-bold text-green-400">141k€</div>
            <div className="text-slate-300 text-sm">Bénéfice moyen</div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <div className="text-3xl font-bold text-orange-400">2 sem</div>
            <div className="text-slate-300 text-sm">ROI moyen</div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <div className="text-3xl font-bold text-purple-400">99%</div>
            <div className="text-slate-300 text-sm">Satisfaction</div>
          </div>
        </div>
      </section>

      {/* CASE STUDIES SECTION */}
      <section id="case-studies" className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-5xl font-bold text-center text-white mb-16">
          Nos Réalisations
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {caseStudies.map((study) => (
            <Link key={study.id} href={`/consulting/case-${study.id}`}>
              <div className="group cursor-pointer h-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-slate-600 rounded-xl overflow-hidden transition-all hover:shadow-xl">
                <div className={`bg-gradient-to-r ${study.color} p-8 h-32 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform`}>
                  {study.icon}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{study.title}</h3>
                  <p className="text-slate-400 text-sm mb-4">{study.subtitle}</p>

                  <div className="bg-slate-700/50 p-3 rounded mb-4 border-l-4 border-blue-400">
                    <p className="text-sm font-semibold text-blue-300">{study.stat}</p>
                  </div>

                  <span className="inline-block px-3 py-1 bg-slate-700 text-slate-300 text-xs rounded-full">
                    {study.sector}
                  </span>
                </div>

                <div className="px-6 pb-6 pt-2">
                  <div className="text-blue-400 text-sm font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                    Lire la case →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-5xl font-bold text-center text-white mb-16">
          Le Processus
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-blue-400/50 transition-colors">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-5xl font-bold text-center text-white mb-16">
          Tarification Simple
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: 'Audit Gratuit',
              price: '0€',
              duration: '30 min',
              features: ['Analyse situation', 'Identification gains', 'Proposition sans engagement'],
              cta: 'Réserver →',
            },
            {
              name: 'Petit Projet',
              price: '1,500€',
              duration: 'one-time',
              features: ['1-2 automations', '2 semaines', 'Support inclus'],
              cta: 'Commencer',
              highlight: true,
            },
            {
              name: 'Projet Standard',
              price: '3,000€+',
              duration: 'one-time',
              features: ['2-4 automations', '4 semaines', 'Formation + Support'],
              cta: 'Commencer',
            },
          ].map((plan, i) => (
            <div
              key={i}
              className={`rounded-lg p-8 border transition-all ${
                plan.highlight
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500 ring-2 ring-blue-400 transform scale-105'
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
              }`}
            >
              <h3 className={`text-2xl font-bold mb-2 ${plan.highlight ? 'text-white' : 'text-white'}`}>
                {plan.name}
              </h3>
              <div className={`text-4xl font-bold mb-2 ${plan.highlight ? 'text-white' : 'text-blue-400'}`}>
                {plan.price}
              </div>
              <p className={`text-sm mb-6 ${plan.highlight ? 'text-blue-100' : 'text-slate-400'}`}>
                {plan.duration}
              </p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className={`flex items-center gap-2 ${plan.highlight ? 'text-white' : 'text-slate-300'}`}>
                    <Check size={16} className={plan.highlight ? 'text-white' : 'text-blue-400'} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-3 px-6 rounded-lg font-bold transition-all ${
                plan.highlight
                  ? 'bg-white text-blue-600 hover:bg-blue-50'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section id="audit" className="max-w-2xl mx-auto px-4 py-20">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à gagner du temps ?
          </h2>

          <p className="text-blue-100 mb-8 text-lg">
            Réservez votre audit gratuit de 30 minutes. Sans engagement. 
            Découvrez exactement combien vous pouvez économiser.
          </p>

          <div className="mb-8">
            <div className="inline-block px-6 py-3 bg-white/20 border border-white/30 rounded-lg text-white font-semibold backdrop-blur-sm">
              ✓ Pas de CC requis • ✓ Sans engagement • ✓ Réponse en 24h
            </div>
          </div>

          <Link href="/consulting/booking">
            <button className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg">
              Réserver audit gratuit →
            </button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-700 py-12 mt-20">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-400">
          <p>© 2025 OPUS Automation. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}