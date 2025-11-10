import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-400 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 py-12">
          {/* OPUS Info */}
          <div>
            <h4 className="text-white font-bold mb-4">OPUS</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/consulting" className="hover:text-white transition-colors">
                  Consulting
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-bold mb-4">Produit</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#features" className="hover:text-white transition-colors">
                  Fonctionnalités
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-white transition-colors">
                  Tarification
                </Link>
              </li>
              <li>
                <Link href="/consulting" className="hover:text-white transition-colors">
                  Cas d'études
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-bold mb-4">Entreprise</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:contact@opus.app" className="hover:text-white transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="mailto:support@opus.app" className="hover:text-white transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold mb-4">Légal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/legal/conditions" className="hover:text-white transition-colors">
                  Conditions
                </Link>
              </li>
              <li>
                <Link href="/legal/confidentialite" className="hover:text-white transition-colors">
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link href="/legal/mentions-legales" className="hover:text-white transition-colors">
                  Mentions légales
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <p>© {currentYear} OPUS Automation. Tous droits réservés.</p>
            <div className="flex gap-6">
              <Link href="/legal/confidentialite" className="hover:text-white transition-colors">
                Confidentialité
              </Link>
              <Link href="/legal/conditions" className="hover:text-white transition-colors">
                Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}