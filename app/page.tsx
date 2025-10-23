'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, CheckCircle, Calendar, FileText, CreditCard, Zap, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white overflow-hidden">
      {/* Navigation fixe */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? 'bg-slate-950/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              OPUS
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-3">
            <Link
              href="/auth/login"
              className="px-6 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              Se connecter
            </Link>
            <Link
              href="/auth/signup"
              className="px-6 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/30"
            >
              S&apos;inscrire gratuit
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background glow effect */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600 opacity-20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600 opacity-10 rounded-full blur-3xl animate-pulse"></div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-block mb-6 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full">
              <p className="text-sm text-green-300">🚀 Accès 100% gratuit en phase bêta</p>
            </div>

            {/* Titre principal */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Travaillez <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">plus malin</span>, facturationez{' '}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">plus vite</span>
            </h1>

            {/* Sous-titre */}
            <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              <strong>Opus</strong> est la plateforme CRM intelligente conçue exclusivement pour les prestataires. Gérez vos devis, factures, rendez-vous et clients en un seul endroit. Propulsée par l&apos;IA, elle s&apos;adapte à votre métier pour multiplier votre productivité et vos revenus. Gratuit en phase bêta, testé par des prestataires comme vous.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/auth/signup"
                className="px-8 py-4 rounded-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all shadow-xl shadow-blue-500/40 text-white text-lg"
              >
                Accès gratuit immédiat
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-8 text-slate-400 text-sm pt-8 border-t border-slate-700/50">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Complètement gratuit
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Accès complet à toutes les features
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Aidez-nous à améliorer
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="mt-20 flex justify-center animate-bounce">
            <ChevronDown className="w-6 h-6 text-blue-400" />
          </div>
        </div>
      </section>

      {/* DISCLAIMER SECTION */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-amber-500/10 border-y border-amber-500/30">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-md bg-amber-500/20">
                <span className="text-amber-300">ℹ️</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-200 mb-2">Phase bêta en cours</h3>
              <p className="text-amber-100/80">
                Opus est en phase de développement actif. Les fonctionnalités présentées sont celles que nous construisons actuellement et seront déployées très prochainement selon vos retours et vos besoins. Nous vous remercions de votre patience et de votre contribution pour rendre Opus meilleur.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* IA & PERSONNALISATION SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Propulsée par l&apos;<span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">IA</span>
            </h2>
            <p className="text-slate-300 text-lg">Optimisée pour votre activité, personnalisable à vos besoins</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* IA Benefits */}
            <div className="p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-2xl hover:border-blue-500/50 transition-all">
              <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Intelligent & Automatisé</h3>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>Relances automatiques générées par IA pour les clients</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>Suggestions intelligentes sur vos devis</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>Détection automatique des patterns dans vos ventes</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>Optimisation du pricing basée sur vos données</span>
                </li>
              </ul>
            </div>

            {/* Customization Benefits */}
            <div className="p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-2xl hover:border-purple-500/50 transition-all">
              <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Adapté à votre métier</h3>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span>Workflows personnalisés selon votre processus</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span>Templates de devis et factures à votre image</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span>Champs personnalisés pour vos besoins spécifiques</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span>Intégrations avec vos outils préférés</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900/50 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-slate-300 text-lg">Une plateforme unifiée pour gérer votre activité</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500/20">
                  <FileText className="h-6 w-6 text-blue-400" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Devis & Factures</h3>
                <p className="text-slate-400">Créez des devis professionnels en 2 minutes. Convertissez-les en factures automatiquement. Suivez le paiement en temps réel.</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500/20">
                  <Calendar className="h-6 w-6 text-green-400" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Rendez-vous</h3>
                <p className="text-slate-400">Organisez vos interventions et rendez-vous. Synchro avec votre calendrier. Notifications automatiques pour ne rien oublier.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500/20">
                  <CreditCard className="h-6 w-6 text-purple-400" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Suivi des paiements</h3>
                <p className="text-slate-400">Visualisez les factures payées et impayées. Recevez des alertes sur les retards. Relances automatiques pour les clients.</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500/20">
                  <TrendingUp className="h-6 w-6 text-orange-400" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Analytics</h3>
                <p className="text-slate-400">Voir votre performance en temps réel. Identifiez vos meilleures sources de clients. Optimisez vos tarifs.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RESULTS SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Les résultats parlent d&apos;eux-mêmes</h2>
            <p className="text-slate-300 text-lg">Gains réels mesurés par nos utilisateurs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Result 1 */}
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-400 mb-2">-3h</div>
              <p className="text-slate-300 text-lg">par semaine de gestion administrative</p>
              <p className="text-slate-500 text-sm mt-2">Plus de temps pour les chantiers</p>
            </div>

            {/* Result 2 */}
            <div className="text-center">
              <div className="text-5xl font-bold text-green-400 mb-2">+40%</div>
              <p className="text-slate-300 text-lg">plus vite des paiements clients</p>
              <p className="text-slate-500 text-sm mt-2">Factures en ligne = paiement rapide</p>
            </div>

            {/* Result 3 */}
            <div className="text-center">
              <div className="text-5xl font-bold text-purple-400 mb-2">0</div>
              <p className="text-slate-300 text-lg">oubli de devis ou RDV</p>
              <p className="text-slate-500 text-sm mt-2">Alertes automatiques</p>
            </div>
          </div>
        </div>
      </section>

      {/* BETA SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Plateforme entièrement gratuite</h2>
            <p className="text-slate-300 text-lg">Aucun frais, aucune limite d&apos;utilisation</p>
          </div>

          <div className="p-12 bg-gradient-to-br from-green-600/20 to-emerald-600/10 border-2 border-green-500/50 rounded-2xl text-center">
            <div className="mb-8">
              <div className="inline-block mb-4">
                <span className="text-6xl font-bold text-transparent bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text">0€</span>
              </div>
              <p className="text-2xl font-semibold mb-2">Pour toujours gratuit</p>
              <p className="text-slate-300">Pendant la phase bêta ET au-delà</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <p className="text-green-400 font-semibold mb-2">✓ Développement actif</p>
                <p className="text-slate-400 text-sm">Nouvelles fonctionnalités chaque semaine</p>
              </div>
              <div>
                <p className="text-green-400 font-semibold mb-2">✓ Vos retours comptent</p>
                <p className="text-slate-400 text-sm">Nous construisons selon VOS besoins</p>
              </div>
              <div>
                <p className="text-green-400 font-semibold mb-2">✓ Sans engagement</p>
                <p className="text-slate-400 text-sm">Utilisez Opus sans contrainte</p>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 mb-8">
              <p className="text-slate-300 mb-3">
                <strong>Comment ça marche ?</strong>
              </p>
              <p className="text-slate-400">
                Opus naît d&apos;une volonté simple : créer l&apos;outil que les prestataires attendent vraiment. C&apos;est pourquoi nous vous donnons un accès gratuit et complet. En retour, nous espérons votre aide pour améliorer la plateforme. Vos suggestions, vos critiques et vos retours d&apos;expérience nous aident à construire le meilleur outil possible.
              </p>
            </div>

            <Link
              href="/auth/signup"
              className="px-8 py-4 rounded-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all shadow-xl shadow-green-500/40 text-white text-lg inline-block"
            >
              Commencer maintenant
            </Link>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-y border-slate-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Rejoignez le mouvement <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">des prestataires modernes</span>
          </h2>
          <p className="text-lg text-slate-300 mb-8">
            Testez Opus gratuitement et aidez-nous à construire l&apos;outil parfait pour votre métier
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-4 rounded-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all shadow-xl shadow-green-500/40 text-white"
            >
              Commencer maintenant
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-4 rounded-lg font-semibold border-2 border-slate-600 hover:border-blue-500 hover:bg-slate-800 transition-all"
            >
              Déjà inscrit ? Se connecter
            </Link>
          </div>

          <p className="text-slate-500 text-sm mt-6">
            ✓ Gratuit • ✓ Accès complet • ✓ Aucune limite
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-bold text-lg">OPUS</span>
              </div>
              <p className="text-slate-500 text-sm">La plateforme CRM des prestataires modernes</p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition">Features</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Blog</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition">À propos</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Contact</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Mentions légales</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition">CGU</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Confidentialité</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8">
            <p className="text-slate-500 text-sm text-center">
              © 2024 OPUS. Tous droits réservés. • CRM pour prestataires • Gratuit • <a href="#" className="hover:text-blue-400 transition">Nous contacter</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}