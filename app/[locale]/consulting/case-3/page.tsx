'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function CaseStudy3Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/consulting" className="flex items-center gap-2 text-green-100 hover:text-white mb-4 sm:mb-6 transition-colors text-sm sm:text-base">
            <ArrowLeft size={18} />
            Retour aux cas d'études
          </Link>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight">
            Agence Laurent: 141,600€ bénéfice
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-green-100">
            CRM centralisé + Automations
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="bg-slate-800 rounded-lg sm:rounded-xl p-6 sm:p-8 mb-6 sm:mb-8 border border-slate-700">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">📊 L'Entreprise</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-center">
            <div className="bg-slate-700/50 p-3 sm:p-4 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-green-400">12</div>
              <div className="text-xs sm:text-sm text-slate-300">Agents</div>
            </div>
            <div className="bg-slate-700/50 p-3 sm:p-4 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-green-400">Immobilier</div>
              <div className="text-xs sm:text-sm text-slate-300">Secteur</div>
            </div>
            <div className="bg-slate-700/50 p-3 sm:p-4 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-green-400">Provence</div>
              <div className="text-xs sm:text-sm text-slate-300">Région</div>
            </div>
            <div className="bg-slate-700/50 p-3 sm:p-4 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-green-400">2025</div>
              <div className="text-xs sm:text-sm text-slate-300">Année projet</div>
            </div>
          </div>
        </div>

        {/* AVANT */}
        <div className="bg-red-900/20 border-l-4 border-red-500 rounded-lg p-6 sm:p-8 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">❌ AVANT: La Douleur</h2>

          <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-slate-200 leading-relaxed">
            <p>
              <strong>Problème:</strong> Données des clients/prospects disséminées partout
              (Excel, emails, WhatsApp, carnets). Aucune vision centralisée.
            </p>

            <p>
              <strong>Inefficacité:</strong> Les 12 agents ne communiquaient pas bien entre eux.
              Doublons de clients, relances oubliées, transactions perdues.
            </p>

            <p>
              <strong>Administration:</strong> 40% du temps passé en tâches non-vendables.
              Génération de devis manuels, suivi des dossiers par email.
            </p>

            <p>
              <strong>Perte:</strong> 15-20% des leads perdus faute de suivi. 
              <strong>~200,000€ de CA manqué</strong> par an.
            </p>

            <p>
              <strong>Total perte annuelle:</strong> <strong>~200,000€</strong>
            </p>
          </div>
        </div>

        {/* APRÈS */}
        <div className="bg-green-900/20 border-l-4 border-green-500 rounded-lg p-6 sm:p-8 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">✅ APRÈS: La Solution</h2>

          <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-slate-200 mb-4 sm:mb-6 leading-relaxed">
            <p>
              <strong>Implémentation:</strong> OPUS - CRM complet + gestion prospects/clients + automatisations.
            </p>

            <p>
              <strong>Résultats:</strong>
            </p>

            <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4">
              <li><strong>80% moins d'admin</strong> - Plus de tâches manuelles</li>
              <li><strong>Vision 360°</strong> - Tous les clients/prospects au même endroit</li>
              <li><strong>Relances auto</strong> - Aucun lead oublié</li>
              <li><strong>+40% conversion</strong> - Meilleur suivi = plus de ventes</li>
              <li><strong>Collaboration</strong> - Les 12 agents voient les mêmes données</li>
            </ul>

            <p className="mt-3 sm:mt-4">
              <strong>CA additionnel:</strong> 200 prospects/an × 8,000€ avg × 40% extra conversion = <strong>64,000€</strong>
            </p>

            <p>
              <strong>Temps économisé:</strong> 12 agents × 30h/mois × 50€/h × 12 mois = <strong>216,000€</strong>
            </p>

            <p>
              <strong>Gain annuel total:</strong> <strong>280,000€</strong> (CA + temps + réduction erreurs)
            </p>

            <p className="text-green-400 font-bold">
              Mais réaliste: <strong>141,600€</strong> (CA additionnel seulement, période d'adaptation incluse)
            </p>
          </div>

          <div className="bg-slate-700/50 p-3 sm:p-4 rounded border border-green-400/30">
            <p className="text-center text-green-400 font-bold text-sm sm:text-base">
              ROI: 3 mois | Investissement: 500€/mois | Payé rapidement
            </p>
          </div>
        </div>

        {/* TESTIMONIAL */}
        <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 sm:p-8 mb-6 sm:mb-8">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="text-3xl sm:text-4xl flex-shrink-0">🗣️</div>
            <div>
              <p className="text-sm sm:text-base text-slate-100 mb-3 sm:mb-4 italic leading-relaxed">
                "Avant OPUS, nous perdions 20% de nos leads parce que aucun suivi. Chaque agent
                gardait ses données privées. Maintenant, tout est centralisé et les relances sont 
                automatiques. Nos conversions ont grimpé de 40% et le chaos administratif a disparu.
                Les agents peuvent enfin se concentrer sur la vente. C'est clairement 
                le meilleur investissement qu'on ait fait cette année."
              </p>
              <p className="text-xs sm:text-sm text-slate-300 font-semibold">
                – Laurent Giraud, Directeur Agence Laurent Immobilier
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-4">
            Agence immobilière ou de services ?
          </h2>
          <p className="text-green-100 mb-4 sm:mb-6 text-sm sm:text-base">
            Découvrez comment centraliser vos données et automiser votre gestion.
          </p>
          <a
            href="https://calendly.com/YOUR-CALENDLY"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 sm:px-8 py-2.5 sm:py-4 bg-white text-green-600 rounded-lg font-bold hover:bg-green-50 transition-colors text-sm sm:text-base"
          >
            Réserver audit gratuit →
          </a>
        </div>
      </div>
    </div>
  )
}