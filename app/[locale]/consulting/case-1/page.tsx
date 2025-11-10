'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function CaseStudyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/consulting" className="flex items-center gap-2 text-blue-100 hover:text-white mb-4 sm:mb-6 transition-colors text-sm sm:text-base">
            <ArrowLeft size={18} />
            Retour aux cas d'études
          </Link>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight">
            Triangle-Bois: 70,200€ économisés/an
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-blue-100">
            Automatisation du bilan social pour 30 employés
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="bg-slate-800 rounded-lg sm:rounded-xl p-6 sm:p-8 mb-6 sm:mb-8 border border-slate-700">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">📊 L'Entreprise</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-center">
            <div className="bg-slate-700/50 p-3 sm:p-4 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-blue-400">30</div>
              <div className="text-xs sm:text-sm text-slate-300">Employés</div>
            </div>
            <div className="bg-slate-700/50 p-3 sm:p-4 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-blue-400">Menuiserie</div>
              <div className="text-xs sm:text-sm text-slate-300">Secteur</div>
            </div>
            <div className="bg-slate-700/50 p-3 sm:p-4 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-blue-400">Rhône-Alpes</div>
              <div className="text-xs sm:text-sm text-slate-300">Région</div>
            </div>
            <div className="bg-slate-700/50 p-3 sm:p-4 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-blue-400">2025</div>
              <div className="text-xs sm:text-sm text-slate-300">Année projet</div>
            </div>
          </div>
        </div>

        {/* AVANT */}
        <div className="bg-red-900/20 border-l-4 border-red-500 rounded-lg p-6 sm:p-8 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">❌ AVANT: La Douleur</h2>

          <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-slate-200 leading-relaxed">
            <p>
              <strong>Problème:</strong> Création du bilan social individuel = 3-4h par employé.
              Avec 30 employés, c'était <strong>90-120 heures de travail par mois</strong> !
            </p>

            <p>
              <strong>Process:</strong> Extraction manuelle données RH → Excel → Graphiques → PDF.
              Erreurs de calculs fréquentes, risque d'oublis.
            </p>

            <p>
              <strong>Coût:</strong> DAF + 1 assistant = 120h × 50€/h = <strong>6,000€/mois</strong>
            </p>

            <p>
              <strong>Total perte annuelle:</strong> <strong>72,000€</strong>
            </p>
          </div>
        </div>

        {/* APRÈS */}
        <div className="bg-green-900/20 border-l-4 border-green-500 rounded-lg p-6 sm:p-8 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">✅ APRÈS: La Solution</h2>

          <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-slate-200 mb-4 sm:mb-6 leading-relaxed">
            <p>
              <strong>Implémentation:</strong> Automatisation complète du processus de génération.
            </p>

            <p>
              <strong>Résultats:</strong> 120h/mois → 3h/mois <strong>(-97%)</strong>
            </p>

            <p>
              <strong>Erreurs:</strong> <strong>0</strong> (calculs automatiques)
            </p>

            <p>
              <strong>Délai:</strong> 30 bilans générés en <strong>5 minutes</strong> (vs 4-5 jours avant)
            </p>

            <p>
              <strong>Gain annuel:</strong> 117h × 50€/h = <strong>5,850€/mois = 70,200€/an</strong>
            </p>
          </div>

          <div className="bg-slate-700/50 p-3 sm:p-4 rounded border border-green-400/30">
            <p className="text-center text-green-400 font-bold text-sm sm:text-base">
              ROI: 2 semaines | Investissement: 800€ | Payé après 1 mois
            </p>
          </div>
        </div>

        {/* TESTIMONIAL */}
        <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 sm:p-8 mb-6 sm:mb-8">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="text-3xl sm:text-4xl flex-shrink-0">🗣️</div>
            <div>
              <p className="text-sm sm:text-base text-slate-100 mb-3 sm:mb-4 italic leading-relaxed">
                "Avant, créer les bilans sociaux de 30 employés prenait une semaine entière. 
                Nous devions embaucher un assistant juste pour cette tâche. Maintenant, 
                c'est complètement automatique - 30 bilans générés en 5 minutes. Ça m'a libéré 
                70k€/an et les employés sont plus contents (ils reçoivent leur bilan immédiatement). 
                Meilleur investissement qu'on ait fait."
              </p>
              <p className="text-xs sm:text-sm text-slate-300 font-semibold">
                – Sandrine Thil, DAF Triangle-Bois
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-4">
            Situation similaire ?
          </h2>
          <p className="text-blue-100 mb-4 sm:mb-6 text-sm sm:text-base">
            Découvrez ce qu'on peut automatiser pour vous.
          </p>
          <a
            href="https://calendly.com/YOUR-CALENDLY"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 sm:px-8 py-2.5 sm:py-4 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-colors text-sm sm:text-base"
          >
            Réserver audit gratuit →
          </a>
        </div>
      </div>
    </div>
  )
}