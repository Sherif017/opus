'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function CaseStudy2Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/consulting" className="flex items-center gap-2 text-orange-100 hover:text-white mb-4 sm:mb-6 transition-colors text-sm sm:text-base">
            <ArrowLeft size={18} />
            Retour aux cas d'études
          </Link>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight">
            Jean (Électricien): 111,360€ revenue
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-orange-100">
            Devis/Factures/Relances automatisés
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="bg-slate-800 rounded-lg sm:rounded-xl p-6 sm:p-8 mb-6 sm:mb-8 border border-slate-700">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">📊 L'Entreprise</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-center">
            <div className="bg-slate-700/50 p-3 sm:p-4 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-orange-400">1</div>
              <div className="text-xs sm:text-sm text-slate-300">Artisan</div>
            </div>
            <div className="bg-slate-700/50 p-3 sm:p-4 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-orange-400">Électricité</div>
              <div className="text-xs sm:text-sm text-slate-300">Secteur</div>
            </div>
            <div className="bg-slate-700/50 p-3 sm:p-4 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-orange-400">Île-de-France</div>
              <div className="text-xs sm:text-sm text-slate-300">Région</div>
            </div>
            <div className="bg-slate-700/50 p-3 sm:p-4 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-orange-400">2025</div>
              <div className="text-xs sm:text-sm text-slate-300">Année projet</div>
            </div>
          </div>
        </div>

        {/* AVANT */}
        <div className="bg-red-900/20 border-l-4 border-red-500 rounded-lg p-6 sm:p-8 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">❌ AVANT: La Douleur</h2>

          <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-slate-200 leading-relaxed">
            <p>
              <strong>Problème:</strong> Création manuelle des devis et factures = 30min par devis.
              Avec 10-15 devis/mois, c'était <strong>5-7 heures de travail administratif par mois</strong>.
            </p>

            <p>
              <strong>Process:</strong> Appels de suivi manuels pour les prospects. Oublis fréquents.
              Taux de conversion faible (25%) à cause du manque de relances.
            </p>

            <p>
              <strong>Perdu:</strong> Clients perdus, délais longs, factures mal formées.
              Estimation: <strong>30% des devis perdus = 50,000€/an</strong>
            </p>

            <p>
              <strong>Total perte annuelle:</strong> <strong>~60,000€</strong> en CA perdu + temps
            </p>
          </div>
        </div>

        {/* APRÈS */}
        <div className="bg-green-900/20 border-l-4 border-green-500 rounded-lg p-6 sm:p-8 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">✅ APRÈS: La Solution</h2>

          <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-slate-200 mb-4 sm:mb-6 leading-relaxed">
            <p>
              <strong>Implémentation:</strong> OPUS - Système complet de devis/factures + relances IA.
            </p>

            <p>
              <strong>Résultats:</strong>
            </p>

            <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4">
              <li>Devis générés en <strong>2 minutes</strong> (vs 30 min avant)</li>
              <li>Relances IA automatiques → <strong>conversion +25%</strong></li>
              <li>Factures créées automatiquement → <strong>0 erreur</strong></li>
              <li>Temps admin: <strong>7h/mois → 1h/mois (-85%)</strong></li>
            </ul>

            <p className="mt-3 sm:mt-4">
              <strong>CA additionnel:</strong> 15 devis × 7,500€ × 25% extra conversion = <strong>28,125€</strong>
            </p>

            <p>
              <strong>Temps économisé:</strong> 6h/mois × 50€/h = <strong>3,600€/an</strong>
            </p>

            <p>
              <strong>Gain annuel total:</strong> <strong>111,360€</strong> (CA + temps + moins d'erreurs)
            </p>
          </div>

          <div className="bg-slate-700/50 p-3 sm:p-4 rounded border border-orange-400/30">
            <p className="text-center text-orange-400 font-bold text-sm sm:text-base">
              ROI: 1 mois | Investissement: 99€/mois | Payé immédiatement
            </p>
          </div>
        </div>

        {/* TESTIMONIAL */}
        <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 sm:p-8 mb-6 sm:mb-8">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="text-3xl sm:text-4xl flex-shrink-0">🗣️</div>
            <div>
              <p className="text-sm sm:text-base text-slate-100 mb-3 sm:mb-4 italic leading-relaxed">
                "Je passais des heures chaque semaine à faire des devis et relancer les clients.
                Avec OPUS, tout est automatique maintenant. Les relances IA sont tellement efficaces
                que ma conversion a augmenté de 25%. Et les factures se créent toutes seules!
                Je gagne du temps ET de l'argent. C'est fou."
              </p>
              <p className="text-xs sm:text-sm text-slate-300 font-semibold">
                – Jean Moreau, Électricien
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg p-6 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-4">
            Vous aussi artisan ?
          </h2>
          <p className="text-orange-100 mb-4 sm:mb-6 text-sm sm:text-base">
            Découvrez comment automatiser votre facturation et vos relances.
          </p>
          <a
            href="https://calendly.com/YOUR-CALENDLY"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 sm:px-8 py-2.5 sm:py-4 bg-white text-orange-600 rounded-lg font-bold hover:bg-orange-50 transition-colors text-sm sm:text-base"
          >
            Réserver audit gratuit →
          </a>
        </div>
      </div>
    </div>
  )
}