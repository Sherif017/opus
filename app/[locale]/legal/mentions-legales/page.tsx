'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function MentionsLegalesPage() {
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
      <div className="bg-gradient-to-r from-green-600 to-green-700 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-4">Mentions Légales</h1>
          <p className="text-green-100 text-sm sm:text-base">Dernière mise à jour : Novembre 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 sm:p-8 space-y-6 sm:space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">1. Hébergement</h2>
            <div className="bg-slate-700/50 p-4 sm:p-6 rounded border border-slate-600 space-y-3 text-slate-300 text-sm sm:text-base">
              <div>
                <p className="font-semibold text-white mb-1">Hébergeur</p>
                <p>Vercel Inc.</p>
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Adresse</p>
                <p>440 N Barranca Ave, Covina, CA 91723, USA</p>
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Site</p>
                <p><a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">vercel.com</a></p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">2. Accès à la plateforme</h2>
            <div className="space-y-3 sm:space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p>
                OPUS est une plateforme SaaS (Software as a Service) accessible en ligne à l'adresse :
              </p>
              <p className="bg-slate-700/50 p-3 sm:p-4 rounded border border-slate-600 font-semibold">
                https://opus.boutique
              </p>
              <p>
                L'accès à la plateforme est réservé aux utilisateurs ayant créé un compte et accepté les conditions d'utilisation.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">3. Propriété intellectuelle</h2>
            <div className="space-y-3 sm:space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p>
                Tous les contenus présents sur le site OPUS (textes, images, graphiques, logos, icônes, sons, 
                vidéos, etc.) sont la propriété exclusive d'OPUS ou de ses partenaires.
              </p>
              <p>
                Toute reproduction, distribution, modification ou utilisation sans autorisation écrite est interdite.
              </p>
              <p>
                Les données professionnelles que vous créez (clients, devis, factures) restent votre propriété exclusive.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">4. Responsabilité</h2>
            <div className="space-y-3 sm:space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p>
                OPUS ne peut être tenu responsable des dommages directs ou indirects résultant de l'accès ou 
                de l'utilisation de la plateforme.
              </p>
              <p>
                OPUS s'efforce de fournir une plateforme sans erreurs, mais ne garantit pas l'absence d'anomalies 
                ou d'interruptions.
              </p>
              <p>
                L'utilisateur est seul responsable de l'utilisation qu'il fait de la plateforme.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">5. Liens externes</h2>
            <div className="space-y-3 sm:space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p>
                OPUS n'est pas responsable du contenu des sites externes auxquels renvoient les liens présents 
                sur la plateforme.
              </p>
              <p>
                L'inclusion de liens ne signifie pas une approbation du contenu de ces sites.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">6. Utilisation des données</h2>
            <div className="space-y-3 sm:space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p>
                Pour plus d'informations sur la collecte, l'utilisation et la protection de vos données personnelles, 
                veuillez consulter notre <Link href="/legal/confidentialite" className="text-blue-400 hover:text-blue-300">Politique de Confidentialité</Link>.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">7. Cookies</h2>
            <div className="space-y-3 sm:space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p>
                OPUS utilise des cookies pour améliorer votre expérience utilisateur et analyser l'utilisation 
                de la plateforme.
              </p>
              <p>
                Vous pouvez refuser les cookies non-essentiels dans les paramètres de votre navigateur ou lors 
                de votre première visite.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">8. Modification des mentions légales</h2>
            <div className="space-y-3 sm:space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p>
                OPUS se réserve le droit de modifier ces mentions légales à tout moment sans préavis.
              </p>
              <p>
                Les modifications apportées prendront effet immédiatement à la publication.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">9. Loi applicable</h2>
            <div className="space-y-3 sm:space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p>
                Ces mentions légales sont régies par la loi française. 
                Tout litige concernant l'accès ou l'utilisation de la plateforme sera soumis à la juridiction 
                des tribunaux français.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">10. Contact</h2>
            <div className="space-y-3 sm:space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p>
                Pour toute question concernant ces mentions légales, veuillez nous contacter :
              </p>
              <div className="bg-slate-700/50 p-4 sm:p-6 rounded border border-slate-600 space-y-2 text-xs sm:text-sm">
                <p className="font-semibold text-white">OPUS Automation</p>
                <p>Email: <a href="mailto:contact@opus.app" className="text-blue-400 hover:text-blue-300">contact@opus.app</a></p>
              </div>
            </div>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">11. Service Client</h2>
            <div className="bg-slate-700/50 p-4 sm:p-6 rounded border border-slate-600 space-y-3 text-slate-300 text-sm sm:text-base">
              <p className="font-semibold text-white">Vous avez une question ?</p>
              <p>Notre équipe de support est disponible pour vous aider :</p>
              <ul className="list-disc list-inside space-y-2 ml-2 sm:ml-4">
                <li>Email: <a href="mailto:support@opus.app" className="text-blue-400 hover:text-blue-300">support@opus.app</a></li>
                <li>Temps de réponse: 24h maximum</li>
              </ul>
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