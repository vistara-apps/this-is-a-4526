import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Briefcase, BookOpen, User, Menu } from 'lucide-react'

export default function AppShell({ children, currentPage, setCurrentPage }) {
  const navigation = [
    { id: 'gigs', label: 'Gigs', icon: Briefcase },
    { id: 'guides', label: 'Guides', icon: BookOpen },
    { id: 'optimizer', label: 'Profile', icon: User },
  ]

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="bg-surface shadow-card border-b border-bg">
        <div className="max-w-xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-primary">GigFlow</h1>
              <p className="text-xs text-gray-600">Your curated path to online earning</p>
            </div>
            <div className="scale-75">
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto px-4 py-6 pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-bg shadow-card">
        <div className="max-w-xl mx-auto px-4">
          <div className="flex items-center justify-around py-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex flex-col items-center py-2 px-3 rounded-md transition-colors ${
                    isActive 
                      ? 'text-primary bg-primary/10' 
                      : 'text-gray-600 hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
}