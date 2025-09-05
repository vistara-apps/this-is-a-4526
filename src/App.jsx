import { useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import AppShell from './components/AppShell'
import GigsPage from './components/GigsPage'
import SkillGuidesPage from './components/SkillGuidesPage'
import ProfileOptimizerPage from './components/ProfileOptimizerPage'

function App() {
  const [currentPage, setCurrentPage] = useState('gigs')

  const renderPage = () => {
    switch (currentPage) {
      case 'gigs':
        return <GigsPage />
      case 'guides':
        return <SkillGuidesPage />
      case 'optimizer':
        return <ProfileOptimizerPage />
      default:
        return <GigsPage />
    }
  }

  return (
    <AppShell currentPage={currentPage} setCurrentPage={setCurrentPage}>
      {renderPage()}
    </AppShell>
  )
}

export default App