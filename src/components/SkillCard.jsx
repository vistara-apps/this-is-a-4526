import { useState } from 'react'
import { Lock, Star, Users, Crown } from 'lucide-react'
import Paywall from './Paywall'

export default function SkillCard({ guide }) {
  const [showPaywall, setShowPaywall] = useState(false)
  const [hasAccess, setHasAccess] = useState(!guide.isPremium)

  const handleCardClick = () => {
    if (guide.isPremium && !hasAccess) {
      setShowPaywall(true)
    } else {
      // Show guide content
      alert(`Opening: ${guide.title}\n\n${guide.content}`)
    }
  }

  const handlePaymentSuccess = () => {
    setHasAccess(true)
    setShowPaywall(false)
    // Show the guide content after payment
    alert(`Access granted! Opening: ${guide.title}\n\n${guide.content}`)
  }

  const getSkillColor = (skill) => {
    const colors = {
      writing: 'bg-blue-100 text-blue-800',
      development: 'bg-green-100 text-green-800',
      design: 'bg-purple-100 text-purple-800',
      marketing: 'bg-orange-100 text-orange-800'
    }
    return colors[skill] || 'bg-gray-100 text-gray-800'
  }

  return (
    <>
      <div 
        onClick={handleCardClick}
        className="bg-surface rounded-lg p-4 shadow-card border border-gray-100 hover:border-primary/20 transition-colors cursor-pointer"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{guide.title}</h3>
              {guide.isPremium && (
                <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
              )}
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getSkillColor(guide.skillTag)}`}>
              {guide.skillTag.charAt(0).toUpperCase() + guide.skillTag.slice(1)}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">
          {guide.content}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span>{guide.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{guide.students.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {guide.isPremium ? (
              <div className="flex items-center gap-1 text-xs">
                <Lock className="w-3 h-3 text-yellow-500" />
                <span className="font-medium text-primary">${guide.price}</span>
              </div>
            ) : (
              <span className="text-xs font-medium text-accent">Free</span>
            )}
          </div>
          
          <button className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${
            guide.isPremium && !hasAccess
              ? 'bg-yellow-500 text-white hover:bg-yellow-600'
              : 'bg-primary text-white hover:bg-primary/90'
          }`}>
            {guide.isPremium && !hasAccess ? 'Unlock' : 'Read Guide'}
          </button>
        </div>
      </div>

      {/* Paywall Modal */}
      {showPaywall && (
        <Paywall
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
          onPaymentSuccess={handlePaymentSuccess}
          guide={guide}
        />
      )}
    </>
  )
}