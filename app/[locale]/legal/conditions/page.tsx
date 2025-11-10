'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ConditionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <Link href="/" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm sm:text-base">
            <ArrowLeft size={18} />
            Retour à l'accueil
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-4">Conditions d'Utilisation</h1>
          <p className="text-blue-100 text-sm sm:text-base">Dernière mise à jour : Novembre 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 sm:p-8 space-y-6 sm:space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">1. Acceptation des conditions</h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              En accédant et en utilisant OPUS, vous acceptez d'être lié par ces conditions d'utilisation. 
              Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le service. OPUS se réserve le droit 
              de modifier ces conditions à tout moment. Les modifications prennent effet immédiatement et continuer 
              à utiliser le service après une modification signifie votre acceptation des nouvelles conditions.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">2. Licence et utilisation</h2>
            <div className="space-y-3 sm:space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p>
                OPUS vous accorde une licence limitée, non-exclusive et révocable pour utiliser la plateforme 
                à des fins professionnelles et commerciales légales.
              </p>
              <p>Vous vous engagez à :</p>
              <ul className="list-disc list-inside space-y-2 ml-2 sm:ml-4">
                <li>Ne pas violer les lois applicables</li>
                <li>Ne pas partager vos identifiants de connexion</li>
                <li>Ne pas accéder à des données non autorisées</li>
                <li>Ne pas utiliser le service pour du spam ou du harcèlement</li>
                <li>Ne pas reproduire ou copier le code source</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">3. Compte utilisateur</h2>
            <div className="space-y-3 sm:space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p>
                Vous êtes responsable de la confidentialité de vos identifiants de connexion. 
                Vous acceptez d'être responsable de toute activité effectuée sous votre compte.
              </p>
              <p>
                Vous devez fournir des informations exactes et à jour lors de votre inscription. 
                OPUS se réserve le droit de suspendre ou de supprimer les comptes qui ne respectent pas ces conditions.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">4. Propriété intellectuelle</h2>
            <div className="space-y-3 sm:space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p>
                OPUS et tout son contenu (design, logo, texte, graphiques, images, logiciels) sont la propriété 
                exclusive d'OPUS ou de ses fournisseurs. Vous n'avez pas le droit de reproduire, modifier ou 
                distribuer ce contenu sans autorisation écrite.
              </p>
              <p>
                Vos données (clients, devis, factures) vous appartiennent. OPUS ne revendique aucun droit de propriété 
                sur vos données professionnelles.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">5. Limitation de responsabilité</h2>
            <div className="space-y-3 sm:space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p>
                OPUS fournit le service "en l'état" sans garanties d'aucune sorte. OPUS ne garantit pas que 
                le service sera sans erreurs, ininterrompu ou sécurisé.
              </p>
              <p>
                En aucun cas OPUS ne sera responsable des dommages indirects, accidentels, spéciaux ou 
                punitifs résultant de votre utilisation du service.
              </p>
              <p className="text-xs sm:text-sm text-slate-400 italic">
                La responsabilité totale d'OPUS ne dépassera pas le montant que vous avez payé pour le service au cours 
                des 12 derniers mois.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">6. Disponibilité du service</h2>
            <div className="space-y-3 sm:space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p>
                OPUS s'efforce de maintenir une disponibilité maximale du service. Cependant, nous ne garantissons pas 
                une disponibilité de 100%.
              </p>
              <p>
                OPUS se réserve le droit d'effectuer des maintenances, des mises à jour ou des interruptions temporaires 
                sans préavis.
              </p>
              <p>
                En cas d'indisponibilité prolongée, nous vous informerons par email et prendrons les mesures 
                nécessaires pour rétablir le service.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">7. Résiliation</h2>
            <div className="space-y-3 sm:space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p>
                Vous pouvez résilier votre compte à tout moment en accédant à vos paramètres. 
                La résiliation prend effet immédiatement.
              </p>
              <p>
                OPUS peut résilier votre accès à tout moment et pour n'importe quelle raison, notamment 
                en cas de violation de ces conditions.
              </p>
              <p>
                Après résiliation, vous pouvez télécharger vos données. Les données non téléchargées seront 
                supprimées après 30 jours.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">8. Frais et paiement</h2>
            <div className="space-y-3 sm:space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p>
                Les prix affichés sont en euros TTC. OPUS peut modifier ses tarifs à tout moment, 
                avec un préavis de 30 jours.
              </p>
              <p>
                Tous les paiements doivent être effectués selon les modalités indiquées. 
                OPUS n'accepte aucune responsabilité pour les retards de paiement.
              </p>
              <p>
                Les paiements sont non-remboursables sauf disposition légale contraire ou erreur de notre part.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">9. Loi applicable</h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Ces conditions sont régies par la loi française. Tout litige sera soumis à la juridiction 
              des tribunaux français.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">10. Contact</h2>
            <div className="space-y-3 sm:space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p>
                Pour toute question concernant ces conditions, veuillez nous contacter :
              </p>
              <div className="bg-slate-700/50 p-3 sm:p-4 rounded border border-slate-600">
                <p className="font-semibold text-white mb-2">OPUS Support</p>
                <p>Email: <a href="mailto:support@opus.app" className="text-blue-400 hover:text-blue-300">support@opus.app</a></p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Link */}
        <div className="mt-8 sm:mt-12 text-center">
          <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm sm:text-base transition-colors">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}