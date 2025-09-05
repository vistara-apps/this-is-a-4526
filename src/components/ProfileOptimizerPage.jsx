import { useState } from 'react'
import PitchGenerator from './PitchGenerator'
import { User, Zap, Copy, CheckCircle } from 'lucide-react'

export default function ProfileOptimizerPage() {
  const [selectedSkill, setSelectedSkill] = useState('')
  const [experience, setExperience] = useState('')
  const [specialties, setSpecialties] = useState('')
  const [generatedPitch, setGeneratedPitch] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const skills = [
    'Content Writing',
    'Web Development',
    'Graphic Design',
    'Social Media Marketing',
    'Data Analysis',
    'Virtual Assistant',
    'Translation',
    'Video Editing'
  ]

  const handleGeneratePitch = async () => {
    if (!selectedSkill || !experience) {
      alert('Please fill in all required fields')
      return
    }

    setIsGenerating(true)
    
    // Simulate AI generation (in real app, this would call OpenAI API)
    setTimeout(() => {
      const pitch = generatePitchContent(selectedSkill, experience, specialties)
      setGeneratedPitch(pitch)
      setIsGenerating(false)
    }, 2000)
  }

  const generatePitchContent = (skill, exp, specs) => {
    const templates = {
      'Content Writing': `Hi! I'm a professional content writer with ${exp} of experience creating engaging, SEO-optimized content. I specialize in ${specs || 'blog posts, articles, and web copy'} that drives results. My writing helps businesses connect with their audience and boost their online presence. Let's discuss how I can help grow your brand through compelling content.`,
      'Web Development': `Hello! I'm a skilled web developer with ${exp} of experience building modern, responsive websites. I'm proficient in ${specs || 'React, JavaScript, and modern web technologies'} and focus on creating user-friendly, performant web applications. I'd love to help bring your vision to life with clean, professional code.`,
      'Graphic Design': `Hi there! I'm a creative graphic designer with ${exp} of experience crafting visually stunning designs. I specialize in ${specs || 'branding, logos, and marketing materials'} that capture attention and communicate your message effectively. Let me help elevate your brand with professional, eye-catching designs.`,
      'Social Media Marketing': `Hello! I'm a social media marketing specialist with ${exp} of experience growing brands online. I excel at ${specs || 'content creation, community management, and paid advertising'} across all major platforms. I'll help increase your engagement, followers, and conversions through strategic social media campaigns.`
    }
    
    return templates[skill] || `Hi! I'm a ${skill.toLowerCase()} specialist with ${exp} of experience. I'm passionate about ${specs || 'delivering high-quality results'} and would love to help you achieve your goals. Let's connect and discuss how I can add value to your project.`
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedPitch)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
            <User className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-2">Profile Optimizer</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Create compelling profiles and pitches to land your first gig
        </p>
      </div>

      {/* Form */}
      <div className="bg-surface rounded-lg p-6 shadow-card space-y-4">
        <h3 className="font-semibold text-gray-900 mb-4">Tell us about yourself</h3>
        
        {/* Skill Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Skill <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
          >
            <option value="">Select your main skill</option>
            {skills.map(skill => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>
        </div>

        {/* Experience */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experience Level <span className="text-red-500">*</span>
          </label>
          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
          >
            <option value="">Select experience level</option>
            <option value="1-2 years">1-2 years</option>
            <option value="3-5 years">3-5 years</option>
            <option value="5+ years">5+ years</option>
            <option value="beginner level">Beginner (learning)</option>
          </select>
        </div>

        {/* Specialties */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specialties (optional)
          </label>
          <input
            type="text"
            value={specialties}
            onChange={(e) => setSpecialties(e.target.value)}
            placeholder="e.g., SEO content, e-commerce, healthcare"
            className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            What makes you unique? Any specific niches or tools you excel at?
          </p>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGeneratePitch}
          disabled={isGenerating || !selectedSkill || !experience}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Zap className="w-4 h-4" />
          {isGenerating ? 'Generating...' : 'Generate Pitch'}
        </button>
      </div>

      {/* Generated Pitch */}
      {generatedPitch && (
        <div className="bg-surface rounded-lg p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Your Generated Pitch</h3>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-md transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-md p-4 mb-4">
            <p className="text-sm leading-relaxed text-gray-700">
              {generatedPitch}
            </p>
          </div>

          <div className="text-xs text-gray-500">
            <p className="mb-2">💡 <strong>Tip:</strong> Customize this pitch for each platform and client</p>
            <p>🎯 <strong>Use for:</strong> Upwork proposals, LinkedIn outreach, portfolio descriptions</p>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Profile Optimization Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use a professional profile photo</li>
          <li>• Include relevant keywords in your description</li>
          <li>• Showcase your best work in your portfolio</li>
          <li>• Get client testimonials and reviews</li>
          <li>• Update your skills and certifications regularly</li>
        </ul>
      </div>
    </div>
  )
}