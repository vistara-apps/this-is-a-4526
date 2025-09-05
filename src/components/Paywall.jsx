import { useState } from 'react'
import { X, Lock, Crown, CreditCard, Wallet } from 'lucide-react'
import { usePaymentContext } from '../hooks/usePaymentContext'

export default function Paywall({ isOpen, onClose, onPaymentSuccess, guide }) {
  const [paymentMethod, setPaymentMethod] = useState('crypto')
  const [isProcessing, setIsProcessing] = useState(false)
  const { createSession } = usePaymentContext()

  if (!isOpen) return null

  const handleCryptoPayment = async () => {
    setIsProcessing(true)
    try {
      await createSession()
      onPaymentSuccess()
    } catch (error) {
      console.error('Payment failed:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFiatPayment = () => {
    setIsProcessing(true)
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      onPaymentSuccess()
    }, 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-lg max-w-sm w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold">Premium Content</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-yellow-600" />
          </div>
          <h4 className="font-semibold mb-2">{guide.title}</h4>
          <p className="text-sm text-gray-600 mb-4">
            Unlock this premium guide to access exclusive content and advanced strategies.
          </p>
          <div className="bg-primary/10 rounded-lg p-3 mb-4">
            <span className="text-2xl font-bold text-primary">${guide.price}</span>
            <p className="text-xs text-gray-600 mt-1">One-time payment • Lifetime access</p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setPaymentMethod('crypto')}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-md border transition-colors ${
                paymentMethod === 'crypto'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-gray-200 hover:border-primary/50'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span className="text-sm font-medium">Crypto</span>
            </button>
            <button
              onClick={() => setPaymentMethod('fiat')}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-md border transition-colors ${
                paymentMethod === 'fiat'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-gray-200 hover:border-primary/50'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span className="text-sm font-medium">Card</span>
            </button>
          </div>
        </div>

        {/* Payment Button */}
        <button
          onClick={paymentMethod === 'crypto' ? handleCryptoPayment : handleFiatPayment}
          disabled={isProcessing}
          className="w-full bg-primary text-white py-3 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : `Pay $${guide.price}`}
        </button>

        {/* Security Note */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Secure payment • 30-day money-back guarantee
        </p>
      </div>
    </div>
  )
}