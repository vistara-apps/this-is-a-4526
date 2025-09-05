import { useState } from 'react'
import { X, Lock, Crown, CreditCard, Wallet, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { usePayments } from '../hooks/usePayments'
import { useAuth } from '../contexts/AuthContext'

export default function Paywall({ isOpen, onClose, onPaymentSuccess, guide }) {
  const [paymentMethod, setPaymentMethod] = useState('crypto')
  const { 
    isProcessing, 
    paymentError, 
    processCryptoPayment, 
    processFiatPayment, 
    getPaymentMethods, 
    calculateFees,
    validatePayment,
    clearError
  } = usePayments()
  const { user, isAuthenticated } = useAuth()

  if (!isOpen) return null

  const handlePayment = async () => {
    if (!isAuthenticated) {
      alert('Please connect your wallet to make a purchase')
      return
    }

    if (!guide) {
      alert('Guide information is missing')
      return
    }

    clearError()

    try {
      let result
      if (paymentMethod === 'crypto') {
        result = await processCryptoPayment(guide.price, guide.guideId || guide.guide_id)
      } else {
        // For fiat payments, you would typically collect payment method details first
        // This is a simplified version
        result = await processFiatPayment(guide.price, guide.guideId || guide.guide_id, 'pm_card_visa')
      }

      if (result.success) {
        onPaymentSuccess(result)
      }
    } catch (error) {
      console.error('Payment failed:', error)
    }
  }

  // Get available payment methods
  const availablePaymentMethods = getPaymentMethods()
  
  // Calculate fees for the selected payment method
  const pricing = guide ? calculateFees(guide.price, paymentMethod) : null

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
            <span className="text-2xl font-bold text-primary">${guide?.price || '0.00'}</span>
            <p className="text-xs text-gray-600 mt-1">One-time payment • Lifetime access</p>
            {pricing && (
              <div className="text-xs text-gray-500 mt-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${pricing.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing fee:</span>
                  <span>${pricing.fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-1 mt-1">
                  <span>Total:</span>
                  <span>${pricing.total.toFixed(2)}</span>
                </div>
              </div>
            )}
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

        {/* Error display */}
        {paymentError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700">{paymentError}</span>
          </div>
        )}

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={isProcessing || !isAuthenticated}
          className="w-full bg-primary text-white py-3 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ${pricing ? `$${pricing.total.toFixed(2)}` : `$${guide?.price || '0.00'}`}`
          )}
        </button>

        {!isAuthenticated && (
          <p className="text-xs text-amber-600 text-center mt-2">
            Please connect your wallet to make a purchase
          </p>
        )}

        {/* Security Note */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Secure payment • 30-day money-back guarantee
        </p>
      </div>
    </div>
  )
}
