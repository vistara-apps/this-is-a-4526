import { useState, useCallback } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { parseEther } from 'viem'
import { usePaymentContext } from './usePaymentContext'
import { paymentClient } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export const usePayments = () => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState(null)
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const { createSession } = usePaymentContext()
  const { user, recordPurchase } = useAuth()

  // Process crypto payment using Base USDC
  const processCryptoPayment = useCallback(async (amount, guideId) => {
    if (!isConnected || !address || !walletClient) {
      throw new Error('Wallet not connected')
    }

    if (!user) {
      throw new Error('User not authenticated')
    }

    setIsProcessing(true)
    setPaymentError(null)

    try {
      // Use the existing payment context for micro-transactions
      await createSession()
      
      // For now, we'll simulate the payment completion
      // In a real implementation, you would:
      // 1. Create a payment intent on your backend
      // 2. Have the user sign the transaction
      // 3. Wait for confirmation
      // 4. Record the purchase
      
      const mockTransactionHash = `0x${Math.random().toString(16).substr(2, 64)}`
      
      // Record the purchase in the database
      await recordPurchase(guideId, amount, 'crypto', {
        hash: mockTransactionHash
      })

      return {
        success: true,
        transactionHash: mockTransactionHash
      }
    } catch (error) {
      setPaymentError(error.message)
      throw error
    } finally {
      setIsProcessing(false)
    }
  }, [isConnected, address, walletClient, createSession, user, recordPurchase])

  // Process fiat payment using Stripe
  const processFiatPayment = useCallback(async (amount, guideId, paymentMethodId) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    setIsProcessing(true)
    setPaymentError(null)

    try {
      // Create payment intent
      const paymentIntent = await paymentClient.createPaymentIntent(amount)
      
      // Process the payment
      const result = await paymentClient.processPayment(paymentMethodId, paymentIntent.id)
      
      if (result.status === 'succeeded') {
        // Record the purchase in the database
        await recordPurchase(guideId, amount, 'fiat', {
          paymentIntentId: paymentIntent.id
        })

        return {
          success: true,
          paymentIntentId: paymentIntent.id
        }
      } else {
        throw new Error('Payment failed')
      }
    } catch (error) {
      setPaymentError(error.message)
      throw error
    } finally {
      setIsProcessing(false)
    }
  }, [user, recordPurchase])

  // Get payment methods for a user
  const getPaymentMethods = useCallback(() => {
    const methods = []
    
    if (isConnected && address) {
      methods.push({
        id: 'crypto',
        name: 'Crypto (USDC on Base)',
        icon: '₿',
        description: 'Pay with USDC on Base network'
      })
    }
    
    methods.push({
      id: 'card',
      name: 'Credit/Debit Card',
      icon: '💳',
      description: 'Pay with your credit or debit card'
    })

    return methods
  }, [isConnected, address])

  // Calculate fees for different payment methods
  const calculateFees = useCallback((amount, method) => {
    const fees = {
      crypto: {
        percentage: 0.01, // 1% for crypto
        fixed: 0.001 // Small fixed fee in USDC
      },
      card: {
        percentage: 0.029, // 2.9% for cards
        fixed: 0.30 // $0.30 fixed fee
      }
    }

    const fee = fees[method] || fees.card
    const percentageFee = amount * fee.percentage
    const totalFee = percentageFee + fee.fixed
    const totalAmount = amount + totalFee

    return {
      subtotal: amount,
      fee: totalFee,
      total: totalAmount
    }
  }, [])

  // Validate payment amount
  const validatePayment = useCallback((amount, method) => {
    const errors = []

    if (amount <= 0) {
      errors.push('Amount must be greater than 0')
    }

    if (method === 'crypto') {
      if (!isConnected) {
        errors.push('Wallet must be connected for crypto payments')
      }
      if (amount < 0.01) {
        errors.push('Minimum crypto payment is $0.01')
      }
    }

    if (method === 'card') {
      if (amount < 0.50) {
        errors.push('Minimum card payment is $0.50')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }, [isConnected])

  return {
    isProcessing,
    paymentError,
    processCryptoPayment,
    processFiatPayment,
    getPaymentMethods,
    calculateFees,
    validatePayment,
    clearError: () => setPaymentError(null)
  }
}
