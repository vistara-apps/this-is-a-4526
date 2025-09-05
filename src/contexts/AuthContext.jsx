import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { neynarClient, supabaseClient } from '../services/api'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [farcasterUser, setFarcasterUser] = useState(null)
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  // Initialize user session
  useEffect(() => {
    initializeAuth()
  }, [address, isConnected])

  const initializeAuth = async () => {
    setIsLoading(true)
    
    try {
      if (isConnected && address) {
        // Try to get Farcaster user by wallet address
        const farcasterData = await getFarcasterUserByAddress(address)
        
        if (farcasterData) {
          setFarcasterUser(farcasterData)
          
          // Get or create user in our database
          const dbUser = await getOrCreateUser(farcasterData)
          setUser(dbUser)
        }
      } else {
        // Clear user data if wallet is disconnected
        setUser(null)
        setFarcasterUser(null)
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      setUser(null)
      setFarcasterUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const getFarcasterUserByAddress = async (walletAddress) => {
    try {
      const response = await neynarClient.getUserByCustodyAddress(walletAddress)
      return response.users?.[0] || null
    } catch (error) {
      console.error('Error fetching Farcaster user:', error)
      return null
    }
  }

  const getOrCreateUser = async (farcasterData) => {
    try {
      // First, try to get existing user
      const existingUsers = await supabaseClient.getUser(farcasterData.fid)
      
      if (existingUsers && existingUsers.length > 0) {
        // Update user data with latest Farcaster info
        const updatedUser = await supabaseClient.updateUser(existingUsers[0].user_id, {
          username: farcasterData.username,
          display_name: farcasterData.display_name,
          bio: farcasterData.profile?.bio?.text || '',
          profile_image_url: farcasterData.pfp_url,
          wallet_address: address
        })
        return updatedUser[0] || existingUsers[0]
      } else {
        // Create new user
        const newUser = await supabaseClient.createUser({
          farcaster_id: farcasterData.fid.toString(),
          wallet_address: address,
          username: farcasterData.username,
          display_name: farcasterData.display_name,
          bio: farcasterData.profile?.bio?.text || '',
          profile_image_url: farcasterData.pfp_url
        })
        
        // Create default user preferences
        await createDefaultPreferences(newUser[0].user_id)
        
        return newUser[0]
      }
    } catch (error) {
      console.error('Error getting/creating user:', error)
      throw error
    }
  }

  const createDefaultPreferences = async (userId) => {
    try {
      await supabaseClient.request('POST', '/user_preferences', {
        user_id: userId,
        preferred_categories: ['development', 'writing', 'design'],
        skill_level: 'beginner',
        notification_settings: {
          new_gigs: true,
          guide_updates: true,
          milestones: true
        }
      })
    } catch (error) {
      console.error('Error creating default preferences:', error)
    }
  }

  const signOut = async () => {
    try {
      disconnect()
      setUser(null)
      setFarcasterUser(null)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const updateUserProfile = async (updates) => {
    if (!user) return null
    
    try {
      const updatedUser = await supabaseClient.updateUser(user.user_id, updates)
      setUser(updatedUser[0])
      return updatedUser[0]
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  }

  const getUserPreferences = async () => {
    if (!user) return null
    
    try {
      const preferences = await supabaseClient.request('GET', `/user_preferences?user_id=eq.${user.user_id}`)
      return preferences[0] || null
    } catch (error) {
      console.error('Error fetching user preferences:', error)
      return null
    }
  }

  const updateUserPreferences = async (preferences) => {
    if (!user) return null
    
    try {
      const updated = await supabaseClient.request('PATCH', `/user_preferences?user_id=eq.${user.user_id}`, preferences)
      return updated[0]
    } catch (error) {
      console.error('Error updating user preferences:', error)
      throw error
    }
  }

  const saveGig = async (gigId) => {
    if (!user) throw new Error('User not authenticated')
    
    try {
      await supabaseClient.saveGig(user.user_id, gigId)
      return true
    } catch (error) {
      console.error('Error saving gig:', error)
      throw error
    }
  }

  const unsaveGig = async (gigId) => {
    if (!user) throw new Error('User not authenticated')
    
    try {
      await supabaseClient.request('DELETE', `/saved_gigs?user_id=eq.${user.user_id}&gig_id=eq.${gigId}`)
      return true
    } catch (error) {
      console.error('Error unsaving gig:', error)
      throw error
    }
  }

  const getSavedGigs = async () => {
    if (!user) return []
    
    try {
      const savedGigs = await supabaseClient.request('GET', `/saved_gigs?user_id=eq.${user.user_id}&select=*,gigs(*)`)
      return savedGigs.map(sg => sg.gigs)
    } catch (error) {
      console.error('Error fetching saved gigs:', error)
      return []
    }
  }

  const markGuideComplete = async (guideId) => {
    if (!user) throw new Error('User not authenticated')
    
    try {
      await supabaseClient.markModuleComplete(user.user_id, guideId)
      return true
    } catch (error) {
      console.error('Error marking guide complete:', error)
      throw error
    }
  }

  const getCompletedGuides = async () => {
    if (!user) return []
    
    try {
      const completed = await supabaseClient.request('GET', `/completed_modules?user_id=eq.${user.user_id}&select=*,skill_guides(*)`)
      return completed.map(cm => cm.skill_guides)
    } catch (error) {
      console.error('Error fetching completed guides:', error)
      return []
    }
  }

  const getPurchasedContent = async () => {
    if (!user) return []
    
    try {
      const purchased = await supabaseClient.request('GET', `/purchased_content?user_id=eq.${user.user_id}&select=*,skill_guides(*)`)
      return purchased.map(pc => pc.skill_guides)
    } catch (error) {
      console.error('Error fetching purchased content:', error)
      return []
    }
  }

  const recordPurchase = async (guideId, amount, paymentMethod, transactionData) => {
    if (!user) throw new Error('User not authenticated')
    
    try {
      const purchaseData = {
        user_id: user.user_id,
        guide_id: guideId,
        amount,
        payment_method: paymentMethod
      }
      
      if (paymentMethod === 'crypto' && transactionData.hash) {
        purchaseData.transaction_hash = transactionData.hash
      } else if (paymentMethod === 'fiat' && transactionData.paymentIntentId) {
        purchaseData.stripe_payment_intent_id = transactionData.paymentIntentId
      }
      
      await supabaseClient.recordPurchase(user.user_id, guideId, amount)
      return true
    } catch (error) {
      console.error('Error recording purchase:', error)
      throw error
    }
  }

  const trackGigInteraction = async (gigId, interactionType) => {
    if (!user) return
    
    try {
      await supabaseClient.request('POST', '/gig_interactions', {
        user_id: user.user_id,
        gig_id: gigId,
        interaction_type: interactionType
      })
    } catch (error) {
      console.error('Error tracking gig interaction:', error)
    }
  }

  const rateGuide = async (guideId, rating, review = '') => {
    if (!user) throw new Error('User not authenticated')
    
    try {
      await supabaseClient.request('POST', '/guide_ratings', {
        user_id: user.user_id,
        guide_id: guideId,
        rating,
        review
      })
      return true
    } catch (error) {
      console.error('Error rating guide:', error)
      throw error
    }
  }

  const value = {
    user,
    farcasterUser,
    isLoading,
    isAuthenticated: !!user,
    signOut,
    updateUserProfile,
    getUserPreferences,
    updateUserPreferences,
    saveGig,
    unsaveGig,
    getSavedGigs,
    markGuideComplete,
    getCompletedGuides,
    getPurchasedContent,
    recordPurchase,
    trackGigInteraction,
    rateGuide
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
