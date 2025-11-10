import { Sidebar } from '@/components/dashboard/Sidebar'
import { Header } from '@/components/dashboard/Header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header />
          
          {/* Content */}
          <main className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}