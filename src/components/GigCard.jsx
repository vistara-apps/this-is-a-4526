import { ExternalLink, Clock, DollarSign, CheckCircle } from 'lucide-react'

export default function GigCard({ gig }) {
  const handleGigClick = () => {
    window.open(gig.url, '_blank', 'noopener,noreferrer')
  }

  const getCategoryColor = (category) => {
    const colors = {
      writing: 'bg-blue-100 text-blue-800',
      development: 'bg-green-100 text-green-800',
      design: 'bg-purple-100 text-purple-800',
      marketing: 'bg-orange-100 text-orange-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="bg-surface rounded-lg p-4 shadow-card border border-gray-100 hover:border-primary/20 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 text-sm">{gig.title}</h3>
            {gig.vetted && (
              <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(gig.category)}`}>
              {gig.category.charAt(0).toUpperCase() + gig.category.slice(1)}
            </span>
            <span className="text-xs text-gray-500">{gig.source}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">
        {gig.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            <span className="font-medium text-primary">{gig.payRate}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatDate(gig.postedDate)}</span>
          </div>
        </div>
        
        <button
          onClick={handleGigClick}
          className="flex items-center gap-1 px-3 py-2 bg-primary text-white text-xs font-medium rounded-md hover:bg-primary/90 transition-colors"
        >
          View Gig
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}