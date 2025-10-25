'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, Zap, BarChart3, Rocket } from 'lucide-react'

export default function HomePage() {
  const [selectedTab, setSelectedTab] = useState('overview')

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/95 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">OP</span>
            </div>
            <span className="font-bold text-xl text-gray-900">OPUS</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              Accueil
            </Link>
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
              Fonctionnalités
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </a>
            <Link href="/dashboard" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
              Essayer
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-2 bg-blue-100 rounded-full">
              <span className="text-blue-600 font-semibold">✨ En phase de test</span>
            </div>

            <h1 className="text-7xl md:text-8xl font-bold text-gray-900 mb-6 leading-tight">
              Automatisez votre <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">business</span>
            </h1>

            <p className="text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              OPUS combine une <strong>plateforme SaaS intelligente</strong> (devis & factures propulsés par l'IA, gestion clients, analytics) avec des <strong>services d'automation consulting sur-mesure</strong>. Gagne du temps, gagne de l'argent.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/dashboard">
                <button className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-lg shadow-lg">
                  Essayer OPUS SaaS →
                </button>
              </Link>

              <Link href="/consulting">
                <button className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors font-bold text-lg shadow-lg">
                  🚀 Découvrir Consulting →
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-600">100%</div>
                <p className="text-gray-600">Gratuit (Phase test)</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600">97%</div>
                <p className="text-gray-600">Temps économisé</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-600">2 sem</div>
                <p className="text-gray-600">ROI moyen</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-600">500€+</div>
                <p className="text-gray-600">Consulting</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OPUS SAAS SECTION */}
      <section id="features" className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-5xl font-bold text-center text-gray-900 mb-4">
            OPUS SaaS - Gratuit en phase test
          </h2>
          <p className="text-center text-xl text-gray-600 mb-3 max-w-2xl mx-auto">
            La plateforme complète pour gérer votre business. Devis, factures, clients, analytics et automations propulsées par l'IA.
          </p>
          <p className="text-center text-gray-500 mb-16 max-w-2xl mx-auto">
            <span className="font-semibold text-gray-700">SaaS</span> (Software as a Service) = Un logiciel dans le cloud, sans installation.
            <span className="mx-4">•</span>
            <span className="font-semibold text-gray-700">CRM</span> (Customer Relationship Management) = Gérez tous vos clients et prospects au même endroit.
          </p>

          {/* FEATURES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-8 shadow-lg border-l-4 border-blue-600 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Devis Intelligents</h3>
              <p className="text-gray-600 mb-4">
                Générez des devis professionnels en quelques secondes. L'IA vous aide à estimer les prix et les délais.
              </p>
              <p className="text-sm text-blue-600 font-semibold">Powered by AI ✨</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-8 shadow-lg border-l-4 border-purple-600 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Relances Intelligentes</h3>
              <p className="text-gray-600 mb-4">
                L'IA analyse vos patterns et envoie les relances au bon moment. Plus de devis oubliés!
              </p>
              <p className="text-sm text-purple-600 font-semibold">Powered by AI ✨</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-8 shadow-lg border-l-4 border-green-600 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Factures Automatiques</h3>
              <p className="text-gray-600 mb-4">
                Dès qu'un devis est accepté, facture créée et envoyée automatiquement. Zéro paperasse.
              </p>
              <p className="text-sm text-green-600 font-semibold">100% Automatisé</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-xl p-8 shadow-lg border-l-4 border-orange-600 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Gestion Clients</h3>
              <p className="text-gray-600 mb-4">
                Base de données centralisée. Toutes les infos de vos clients en un endroit. Historique complet.
              </p>
              <p className="text-sm text-orange-600 font-semibold">Organisé & Accessible</p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-xl p-8 shadow-lg border-l-4 border-red-600 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Dashboard Analytics</h3>
              <p className="text-gray-600 mb-4">
                Visualisez votre revenue en temps réel. Taux de conversion, client lifetime value, et plus.
              </p>
              <p className="text-sm text-red-600 font-semibold">Data-Driven</p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-xl p-8 shadow-lg border-l-4 border-pink-600 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Intégrations Puissantes</h3>
              <p className="text-gray-600 mb-4">
                Connectez Opus à vos outils préférés. Zapier, Make, API custom, ou demandez-nous!
              </p>
              <p className="text-sm text-pink-600 font-semibold">Connexions Illimitées</p>
            </div>

            {/* Feature 7 */}
            <div className="bg-white rounded-xl p-8 shadow-lg border-l-4 border-cyan-600 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">CRM Intégré</h3>
              <p className="text-gray-600 mb-4">
                Un vrai système CRM pour gérer vos prospects et clients. Suivi complet, historique des interactions, notes, et plus.
              </p>
              <p className="text-sm text-cyan-600 font-semibold">Powered by CRM ✨</p>
            </div>
          </div>

          {/* MAIN CTA SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-12 text-white shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-white text-2xl">
                    🚀
                  </div>
                  <h3 className="text-3xl font-bold">OPUS SaaS</h3>
                </div>

                <p className="text-white/90 text-lg mb-8">
                  Une plateforme complète et intuitive. Gratuit pour le moment car nous sommes en phase de test. 
                  Votre feedback nous aide à l'améliorer.
                </p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 flex-shrink-0" />
                    <span>Créez vos premiers devis gratuitement</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 flex-shrink-0" />
                    <span>Pas de limite. Pas de surprises.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 flex-shrink-0" />
                    <span>Propulsé par l'IA</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 flex-shrink-0" />
                    <span>Support complet</span>
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-4 mb-8 border border-white/20">
                  <p className="text-2xl font-bold">Gratuit 🎉</p>
                  <p className="text-white/80 text-sm">Phase de test - tous les retours sont bienvenus</p>
                </div>

                <Link href="/dashboard">
                  <button className="w-full px-6 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-bold text-lg shadow-lg">
                    Essayer maintenant →
                  </button>
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-8">Parfait pour:</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-400 transition-colors">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                    ✓
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Artisans & Prestataires</p>
                    <p className="text-gray-600 text-sm">Électriciens, plombiers, menuisiers, consultants...</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200 hover:border-purple-400 transition-colors">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                    ✓
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">PME & Petites Agences</p>
                    <p className="text-gray-600 text-sm">Immobilier, services, marketing, commerce...</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200 hover:border-green-400 transition-colors">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                    ✓
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Entrepreneurs</p>
                    <p className="text-gray-600 text-sm">Qui cherchent à automatiser et organiser leur business</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg border border-orange-200 hover:border-orange-400 transition-colors">
                  <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                    ✓
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Et vous!</p>
                    <p className="text-gray-600 text-sm">C'est gratuit en phase test. Zéro risque d'essayer!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CASE STUDIES */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-5xl font-bold text-center text-gray-900 mb-4">
            Résultats réels
          </h2>
          <p className="text-center text-xl text-gray-600 mb-16 max-w-2xl mx-auto">
            Voici ce qu'on a réussi à faire pour nos clients avec OPUS SaaS + Consulting
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Case 1 */}
            <Link href="/consulting/case-1">
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all cursor-pointer h-full">
                <div className="text-5xl mb-4">📊</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Triangle-Bois
                </h3>
                <p className="text-gray-600 mb-4">
                  Automatisation bilan social 30 employés
                </p>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="font-bold text-blue-600 text-lg">70,200€ économisés/an</p>
                  <p className="text-sm text-gray-600">120h → 3h/mois (-97%)</p>
                </div>
                <div className="flex items-center gap-2 text-blue-600 font-semibold">
                  Lire la case <ArrowRight size={20} />
                </div>
              </div>
            </Link>

            {/* Case 2 */}
            <Link href="/consulting/case-2">
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all cursor-pointer h-full">
                <div className="text-5xl mb-4">⚡</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Jean (Électricien)
                </h3>
                <p className="text-gray-600 mb-4">
                  Devis/Factures/Relances automatisés
                </p>
                <div className="bg-orange-50 p-4 rounded-lg mb-4">
                  <p className="font-bold text-orange-600 text-lg">111,360€ revenue</p>
                  <p className="text-sm text-gray-600">+25% conversion, 97% gain temps</p>
                </div>
                <div className="flex items-center gap-2 text-blue-600 font-semibold">
                  Lire la case <ArrowRight size={20} />
                </div>
              </div>
            </Link>

            {/* Case 3 */}
            <Link href="/consulting/case-3">
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all cursor-pointer h-full">
                <div className="text-5xl mb-4">🏠</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Agence Laurent
                </h3>
                <p className="text-gray-600 mb-4">
                  CRM centralisé + Automations
                </p>
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <p className="font-bold text-green-600 text-lg">141,600€ bénéfice</p>
                  <p className="text-sm text-gray-600">80% moins d'admin, +40% conversion</p>
                </div>
                <div className="flex items-center gap-2 text-blue-600 font-semibold">
                  Lire la case <ArrowRight size={20} />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CONSULTING SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-5xl font-bold text-center text-gray-900 mb-16">
            Besoin de plus? Découvrez notre Consulting
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* CONSULTING */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-12 border-2 border-green-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white text-2xl">
                  🚀
                </div>
                <h3 className="text-3xl font-bold text-gray-900">OPUS Consulting</h3>
              </div>

              <p className="text-gray-700 text-lg mb-8">
                Services d'automation sur-mesure. Audit gratuit + implémentation complète.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Audit Gratuit</p>
                    <p className="text-gray-600">30 min pour identifier vos gains potentiels</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Automations Custom</p>
                    <p className="text-gray-600">Zapier, Make, scripts - adaptés à votre besoin</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Intégration OPUS</p>
                    <p className="text-gray-600">Tout fonctionne avec votre logiciel</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Formation Incluse</p>
                    <p className="text-gray-600">Vous maîtrisez 100% de la solution</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">ROI Garanti</p>
                    <p className="text-gray-600">Payé en 2-3 mois minimum</p>
                  </div>
                </div>
              </div>

              <Link href="/consulting">
                <button className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold text-lg">
                  Réserver audit gratuit →
                </button>
              </Link>
            </div>

            {/* INFO CONSULTING */}
            <div className="space-y-8">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Pour qui?</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold flex-shrink-0 mt-1">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Artisans</p>
                      <p className="text-gray-600">Électriciens, plombiers, menuisiers...</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold flex-shrink-0 mt-1">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">PME/Agences</p>
                      <p className="text-gray-600">Immobilier, services, commerce...</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold flex-shrink-0 mt-1">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Toute entreprise</p>
                      <p className="text-gray-600">Avec des tâches qui prennent du temps</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Le processus</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Audit gratuit 30 min</p>
                      <p className="text-gray-600 text-sm">Analyser vos tâches chronophages</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Proposal écrite</p>
                      <p className="text-gray-600 text-sm">Plan d'action + chiffrage</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Implémentation</p>
                      <p className="text-gray-600 text-sm">2-4 semaines de mise en place</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Succès</p>
                      <p className="text-gray-600 text-sm">Vous gagnez du temps et de l'argent</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-5xl font-bold text-center text-gray-900 mb-16">
            Pricing
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* SAAS */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">OPUS SaaS</h3>
              <p className="text-gray-600 mb-6">Logiciel de devis/factures + CRM</p>

              <div className="text-4xl font-bold text-blue-600 mb-6">Gratuit</div>

              <p className="text-gray-600 mb-6">
                100% gratuit pour le moment car nous sommes en phase de test. 
                Votre feedback nous aide à l'améliorer.
              </p>

              <Link href="/dashboard">
                <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold">
                  Essayer
                </button>
              </Link>
            </div>

            {/* CONSULTING */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 shadow-lg border-2 border-green-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">OPUS Consulting</h3>
              <p className="text-gray-600 mb-6">Services d'automation sur-mesure</p>

              <div className="text-4xl font-bold text-green-600 mb-6">À partir de 500€</div>

              <p className="text-gray-600 mb-6">
                <strong>Audit gratuit</strong> d'abord, puis pricing custom selon votre projet.
                Petits projets (500-1500€) jusqu'à solutions complètes.
              </p>

              <Link href="/consulting">
                <button className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold">
                  Réserver audit gratuit
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINALE */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-5xl font-bold mb-6">
            Prêt à transformer votre business?
          </h2>

          <p className="text-xl mb-12 opacity-90">
            Commencez avec OPUS SaaS gratuitement, ou réservez un audit consulting pour une solution complète.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <button className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-bold text-lg">
                Essayer SaaS →
              </button>
            </Link>

            <Link href="/consulting">
              <button className="px-8 py-4 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors font-bold text-lg border-2 border-white">
                🚀 Audit consulting gratuit →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">OPUS</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-white transition-colors">Accueil</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">App</Link></li>
                <li><Link href="/consulting" className="hover:text-white transition-colors">Consulting</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Consulting</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/consulting" className="hover:text-white transition-colors">Services</Link></li>
                <li><Link href="/consulting/booking" className="hover:text-white transition-colors">Réserver audit</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Conditions</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Confidentialité</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-sm">© 2025 OPUS. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}