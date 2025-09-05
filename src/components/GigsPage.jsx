import { useState } from 'react'
import GigCard from './GigCard'
import { Search, Filter, TrendingUp } from 'lucide-react'

export default function GigsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Mock data for demonstration
  const gigs = [
    {
      gigId: 1,
      title: 'Content Writer for Tech Blog',
      description: 'Looking for experienced writers to create engaging tech content. Must have knowledge of AI, blockchain, and web development.',
      url: 'https://upwork.com/job/123',
      source: 'Upwork',
      category: 'writing',
      payRate: '$25-50/hour',
      vetted: true,
      postedDate: '2024-01-15'
    },
    {
      gigId: 2,
      title: 'React Developer - Remote',
      description: 'Build modern web applications using React, TypeScript, and Node.js. Perfect for developers with 2+ years experience.',
      url: 'https://freelancer.com/job/456',
      source: 'Freelancer',
      category: 'development',
      payRate: '$40-80/hour',
      vetted: true,
      postedDate: '2024-01-14'
    },
    {
      gigId: 3,
      title: 'Social Media Manager',
      description: 'Manage social media accounts for e-commerce brand. Create content, schedule posts, and engage with followers.',
      url: 'https://fiverr.com/gig/789',
      source: 'Fiverr',
      category: 'marketing',
      payRate: '$20-35/hour',
      vetted: true,
      postedDate: '2024-01-13'
    },
    {
      gigId: 4,
      title: 'UI/UX Designer',
      description: 'Design user interfaces for mobile apps. Experience with Figma and design systems required.',
      url: 'https://99designs.com/job/012',
      source: '99designs',
      category: 'design',
      payRate: '$30-60/hour',
      vetted: true,
      postedDate: '2024-01-12'
    }
  ]

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'writing', label: 'Writing' },
    { id: 'development', label: 'Development' },
    { id: 'design', label: 'Design' },
    { id: 'marketing', label: 'Marketing' }
  ]

  const filteredGigs = gigs.filter(gig => {
    const matchesSearch = gig.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gig.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || gig.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-2">Curated Gigs</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Discover vetted, legitimate online earning opportunities
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search gigs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-surface border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-primary text-white'
                : 'bg-surface text-gray-600 hover:bg-primary/10 hover:text-primary border border-gray-200'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Gigs List */}
      <div className="space-y-4">
        {filteredGigs.length > 0 ? (
          filteredGigs.map(gig => (
            <GigCard key={gig.gigId} gig={gig} />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No gigs found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="bg-surface rounded-lg p-4 shadow-card">
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-primary">{filteredGigs.length}</span> vetted opportunities
          </p>
          <p className="text-xs text-gray-500 mt-1">Updated daily • Scam-free guarantee</p>
        </div>
      </div>
    </div>
  )
}