'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ConfidentialitePage() {
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
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-4">Politique de Confidentialité</h1>
          <p className="text-purple-100 text-sm sm:text-base">Dernière mise à jour : Novembre 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 sm:p-8 space-y-6 sm:space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">1. Responsable du traitement</h2>
            <div className="space-y-3 sm:space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p>
                OPUS Automation SAS ("OPUS", "nous", "notre") est responsable du traitement de vos données personnelles.
              </p>
              <div className="bg-slate-700/50 p-3 sm:p-4 rounded border border-slate-600 text-xs sm:text-sm">
                <p className="font-semibold text-white mb-1">Contact DPO (Délégué Protection Données)</p>
                <p>Email: <a href="mailto:privacy@opus.app" className="text-blue-400 hover:text-blue-300">privacy@opus.app</a></p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">2. Données que nous collectons</h2>
            <div className="space-y-3 sm:space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p><strong>Données d'inscription :</strong> Nom, prénom, email, entreprise, téléphone</p>
              <p><strong>Données de facturation :</strong> Adresse, numéro SIRET/SIREN, mode de paiement</p>
              <p><strong>Données de plateforme :</strong> Clients, prospects, devis, factures que vous créez</p>
              <p><strong>Données techniques :</strong> Adresse IP, type de navigateur, pages visitées, temps de connexion</p>
              <p><strong>Données de communication :</strong> Emails d'assistance, feedback, support</p>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">3. Base légale du traitement</h2>
            <div className="space-y-3 sm:space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p><strong>Exécution du contrat :</strong> Pour fournir le service OPUS</p>
              <p><strong>Consentement :</strong> Pour les emails marketing (vous pouvez vous désabonner)</p>
              <p><strong>Obligation légale :</strong> Comptabilité, impôts, données légales</p>
              <p><strong>Intérêt légitime :</strong> Amélioration du service, prévention des fraudes</p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">4. Utilisation de vos données</h2>
            <div className="space-y-3 sm:space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p>Vos données sont utilisées pour :</p>
              <ul className="list-disc list-inside space-y-2 ml-2 sm:ml-4">
                <li>Fournir et améliorer le service OPUS</li>
                <li>Traiter votre facturation et paiements</li>
                <li>Vous envoyer des notifications et mises à jour</li>
                <li>Répondre à vos demandes d'assistance</li>
                <li>Respecter les obligations légales et réglementaires</li>
                <li>Détecter et prévenir les fraudes</li>
                <li>Analyser l'utilisation du service (avec consentement)</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">5. Partage de vos données</h2>
            <div className="space-y-3 sm:space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p>
                Nous partageons vos données avec des tiers uniquement lorsque c'est nécessaire :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2 sm:ml-4">
                <li><strong>Prestataires :</strong> Hébergement (Supabase), email (Resend), paiements (Stripe)</li>
                <li><strong>Autorités :</strong> Si légalement requis par la loi</li>
                <li><strong>Aucune vente :</strong> Nous ne vendons jamais vos données</li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">6. Sécurité des données</h2>
            <div className="space-y-3 sm:space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p>
                OPUS utilise les mesures de sécurité suivantes :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2 sm:ml-4">
                <li>Chiffrement SSL/TLS pour les connexions</li>
                <li>Chiffrement des mots de passe avec bcrypt</li>
                <li>Authentification multi-facteurs disponible</li>
                <li>Accès aux données limité aux employés autorisés</li>
                <li>Sauvegardes régulières et redondance</li>
                <li>Audits de sécurité réguliers</li>
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">7. Vos droits (RGPD)</h2>
            <div className="space-y-3 sm:space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p>
                Conformément au RGPD, vous avez le droit de :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2 sm:ml-4">
                <li><strong>Accès :</strong> Obtenir une copie de vos données</li>
                <li><strong>Rectification :</strong> Corriger les données inexactes</li>
                <li><strong>Suppression :</strong> Demander la suppression de vos données</li>
                <li><strong>Portabilité :</strong> Recevoir vos données dans un format structuré</li>
                <li><strong>Opposition :</strong> S'opposer au traitement</li>
                <li><strong>Limitation :</strong> Limiter l'utilisation de vos données</li>
              </ul>
              <p className="text-xs sm:text-sm text-slate-400 italic mt-4">
                Pour exercer ces droits, contactez <a href="mailto:privacy@opus.app" className="text-blue-400 hover:text-blue-300">privacy@opus.app</a>
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">8. Durée de conservation</h2>
            <div className="space-y-3 sm:space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p>
                Les données sont conservées aussi longtemps que nécessaire :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2 sm:ml-4">
                <li>Données de compte actif : Tant que le compte est actif</li>
                <li>Données métier : 3 ans minimum (obligation légale)</li>
                <li>Données techniques : 12 mois</li>
                <li>Après suppression : 30 jours avant suppression complète</li>
              </ul>
            </div>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">9. Cookies et suivi</h2>
            <div className="space-y-3 sm:space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p>
                OPUS utilise des cookies pour :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2 sm:ml-4">
                <li>Maintenir votre session connectée</li>
                <li>Analyser l'utilisation du service (Google Analytics)</li>
                <li>Mémoriser vos préférences</li>
              </ul>
              <p>
                Vous pouvez refuser les cookies non-essentiels dans les paramètres de votre navigateur.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">10. Modifications de cette politique</h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              OPUS peut modifier cette politique à tout moment. Les modifications importantes seront communiquées par email.
              La date de dernière mise à jour est indiquée en haut de cette page.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">11. Contact et réclamations</h2>
            <div className="space-y-3 sm:space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p>
                Pour des questions concernant cette politique ou vos droits :
              </p>
              <div className="bg-slate-700/50 p-3 sm:p-4 rounded border border-slate-600 space-y-2 text-xs sm:text-sm">
                <p className="font-semibold text-white">OPUS Privacy</p>
                <p>Email: <a href="mailto:privacy@opus.app" className="text-blue-400 hover:text-blue-300">privacy@opus.app</a></p>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Vous avez aussi le droit de déposer plainte auprès de votre autorité de protection des données 
                (CNIL en France).
              </p>
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