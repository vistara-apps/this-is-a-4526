import { useState } from 'react'
import { Sparkles, Copy, RefreshCw } from 'lucide-react'

export default function PitchGenerator({ selectedSkill, experience, specialties, onGenerate }) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    setIsGenerating(true)
    await onGenerate()
    setIsGenerating(false)
  }

  return (
    <div className="bg-surface rounded-lg p-6 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-gray-900">AI Pitch Generator</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Generate a professional pitch based on your skills and experience
      </p>

      <button
        onClick={handleGenerate}
        disabled={isGenerating || !selectedSkill || !experience}
        className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate Pitch
          </>
        )}
      </button>
    </div>
  )
}