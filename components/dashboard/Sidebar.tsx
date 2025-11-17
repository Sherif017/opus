'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  FileText,
  DollarSign,
  Calendar,
  Zap,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  User,
  ChevronDown,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/clients', label: 'Clients', icon: Users },
  { href: '/dashboard/prospects', label: 'Prospects', icon: TrendingUp },
  { href: '/dashboard/pipeline', label: 'Pipeline', icon: TrendingUp },
  { href: '/dashboard/devis', label: 'Devis', icon: FileText },
  { href: '/dashboard/factures', label: 'Factures', icon: DollarSign },
  { href: '/dashboard/rendez-vous', label: 'Rendez-vous', icon: Calendar },
  { href: '/dashboard/relances', label: 'Relances IA', icon: Zap },
  { href: '/dashboard/audits', label: 'Audits', icon: Calendar },
]

const settingsItems = [
  { href: '/dashboard/settings', label: 'Mon profil', icon: User },
  { href: '/dashboard/settings/company', label: 'Entreprise', icon: Building2 },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Déterminer si on est dans une page de settings
  const isSettingsPage = pathname.startsWith('/dashboard/settings')

  return (
    <aside
      className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-sm ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">OP</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">OPUS</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-medium shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              title={collapsed ? item.label : ''}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Settings Section */}
      <div className="border-t border-gray-200 p-3">
        {/* Settings Toggle Button */}
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
            isSettingsPage
              ? 'bg-blue-50 text-blue-600 font-medium shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
          title={collapsed ? 'Paramètres' : ''}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="text-sm flex-1 text-left">Paramètres</span>
              <ChevronDown
                className={`w-4 h-4 flex-shrink-0 transition-transform ${
                  settingsOpen ? 'rotate-180' : ''
                }`}
              />
            </>
          )}
        </button>

        {/* Settings Submenu - Only show if not collapsed and open */}
        {!collapsed && settingsOpen && (
          <div className="mt-2 space-y-1 bg-gray-50 rounded-lg p-2">
            {settingsItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm ${
                    isActive
                      ? 'bg-blue-100 text-blue-600 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        )}

        {/* Settings Submenu - Compact view when collapsed */}
        {collapsed && isSettingsPage && (
          <div className="mt-2 space-y-1">
            {settingsItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-center p-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-4 h-4" />
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </aside>
  )
}