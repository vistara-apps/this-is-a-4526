import { useState, useEffect } from 'react'
import SkillCard from './SkillCard'
import { BookOpen, Search, Star, Loader2 } from 'lucide-react'
import { supabaseClient } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function SkillGuidesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [guides, setGuides] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  // Fetch guides from API
  useEffect(() => {
    fetchGuides()
  }, [selectedType, searchTerm])

  const fetchGuides = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const filters = {
        search: searchTerm
      }
      
      if (selectedType === 'free') {
        filters.isPremium = false
      } else if (selectedType === 'premium') {
        filters.isPremium = true
      }
      
      const data = await supabaseClient.getSkillGuides(filters)
      setGuides(data || [])
    } catch (err) {
      console.error('Error fetching guides:', err)
      setError('Failed to load guides. Please try again.')
      // Fallback to mock data if API fails
      setGuides([
    {
      guideId: 1,
      title: 'Complete Guide to Freelance Writing',
      content: 'Learn how to start your freelance writing career from scratch. Covers finding clients, setting rates, and building a portfolio.',
      skillTag: 'writing',
      price: 0,
      isPremium: false,
      rating: 4.8,
      students: 1250
    },
    {
      guideId: 2,
      title: 'React Development Mastery',
      content: 'Master React development with this comprehensive guide. Build real projects and learn best practices.',
      skillTag: 'development',
      price: 1.50,
      isPremium: true,
      rating: 4.9,
      students: 890
    },
    {
      guideId: 3,
      title: 'Social Media Marketing Secrets',
      content: 'Discover proven strategies to grow social media accounts and monetize your following.',
      skillTag: 'marketing',
      price: 0,
      isPremium: false,
      rating: 4.6,
      students: 2100
    },
    {
      guideId: 4,
      title: 'Advanced UI/UX Design Principles',
      content: 'Take your design skills to the next level with advanced techniques and industry secrets.',
      skillTag: 'design',
      price: 2.00,
      isPremium: true,
      rating: 4.9,
      students: 560
    },
    {
      guideId: 5,
      title: 'Email Marketing Automation',
      content: 'Build automated email sequences that convert leads into customers.',
      skillTag: 'marketing',
      price: 1.00,
      isPremium: true,
      rating: 4.7,
      students: 340
    },
    {
      guideId: 6,
      title: 'Python for Beginners',
      content: 'Start your programming journey with Python. Perfect for complete beginners.',
      skillTag: 'development',
      price: 0,
      isPremium: false,
      rating: 4.5,
      students: 3200
    }
      ])
    } finally {
      setLoading(false)
    }
  }

  const types = [
    { id: 'all', label: 'All Guides' },
    { id: 'free', label: 'Free' },
    { id: 'premium', label: 'Premium' }
  ]

  // Filter is now handled by the API, but we keep this for client-side filtering if needed
  const filteredGuides = guides

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-accent" />
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-2">Skill Guides</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Quick, actionable guides to start earning with in-demand skills
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search guides..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-surface border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {types.map(type => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedType === type.id
                ? 'bg-accent text-white'
                : 'bg-surface text-gray-600 hover:bg-accent/10 hover:text-accent border border-gray-200'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Guides Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-gray-600">Loading guides...</span>
          </div>
        ) : error ? (
          <div className="col-span-full text-center py-8">
            <p className="text-red-500 mb-2">{error}</p>
            <button 
              onClick={fetchGuides}
              className="text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        ) : filteredGuides.length > 0 ? (
          filteredGuides.map(guide => (
            <SkillCard 
              key={guide.guide_id || guide.guideId} 
              guide={{
                ...guide,
                guideId: guide.guide_id || guide.guideId,
                skillTag: guide.skill_tag || guide.skillTag,
                isPremium: guide.is_premium !== undefined ? guide.is_premium : guide.isPremium,
                students: guide.students_enrolled || guide.students
              }}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No guides found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="bg-surface rounded-lg p-4 shadow-card">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-2">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">4.7 average rating</span>
          </div>
          <p className="text-xs text-gray-500">
            {guides.reduce((total, guide) => total + guide.students, 0).toLocaleString()} students enrolled
          </p>
        </div>
      </div>
    </div>
  )
}
