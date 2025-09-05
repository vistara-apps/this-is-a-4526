import axios from 'axios'

// API Configuration
const API_CONFIG = {
  supabase: {
    url: process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
    key: process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-key'
  },
  openai: {
    key: process.env.VITE_OPENAI_API_KEY || 'your-openai-key'
  },
  neynar: {
    key: process.env.VITE_NEYNAR_API_KEY || 'your-neynar-key',
    baseUrl: 'https://api.neynar.com/v2'
  },
  stripe: {
    publishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY || 'your-stripe-key'
  }
}

// Supabase Client
class SupabaseClient {
  constructor() {
    this.baseURL = `${API_CONFIG.supabase.url}/rest/v1`
    this.headers = {
      'apikey': API_CONFIG.supabase.key,
      'Authorization': `Bearer ${API_CONFIG.supabase.key}`,
      'Content-Type': 'application/json'
    }
  }

  async request(method, endpoint, data = null) {
    try {
      const response = await axios({
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: this.headers,
        data
      })
      return response.data
    } catch (error) {
      console.error('Supabase API Error:', error)
      throw error
    }
  }

  // User operations
  async getUser(farcasterId) {
    return this.request('GET', `/users?farcasterId=eq.${farcasterId}`)
  }

  async createUser(userData) {
    return this.request('POST', '/users', userData)
  }

  async updateUser(userId, userData) {
    return this.request('PATCH', `/users?userId=eq.${userId}`, userData)
  }

  // Gig operations
  async getGigs(filters = {}) {
    let query = '/gigs?vetted=eq.true&order=postedDate.desc'
    
    if (filters.category && filters.category !== 'all') {
      query += `&category=eq.${filters.category}`
    }
    
    if (filters.search) {
      query += `&or=(title.ilike.*${filters.search}*,description.ilike.*${filters.search}*)`
    }
    
    return this.request('GET', query)
  }

  async getGig(gigId) {
    return this.request('GET', `/gigs?gigId=eq.${gigId}`)
  }

  // Skill Guide operations
  async getSkillGuides(filters = {}) {
    let query = '/skill_guides?order=rating.desc'
    
    if (filters.isPremium !== undefined) {
      query += `&isPremium=eq.${filters.isPremium}`
    }
    
    if (filters.search) {
      query += `&or=(title.ilike.*${filters.search}*,content.ilike.*${filters.search}*)`
    }
    
    return this.request('GET', query)
  }

  async getSkillGuide(guideId) {
    return this.request('GET', `/skill_guides?guideId=eq.${guideId}`)
  }

  // Pitch Template operations
  async getPitchTemplates(skillTag = null) {
    let query = '/pitch_templates'
    if (skillTag) {
      query += `?skillTag=eq.${skillTag}`
    }
    return this.request('GET', query)
  }

  // User interactions
  async saveGig(userId, gigId) {
    return this.request('POST', '/saved_gigs', { userId, gigId })
  }

  async markModuleComplete(userId, guideId) {
    return this.request('POST', '/completed_modules', { userId, guideId })
  }

  async recordPurchase(userId, guideId, amount) {
    return this.request('POST', '/purchased_content', { 
      userId, 
      guideId, 
      amount,
      purchaseDate: new Date().toISOString()
    })
  }
}

// OpenAI Client
class OpenAIClient {
  constructor() {
    this.apiKey = API_CONFIG.openai.key
    this.baseURL = 'https://api.openai.com/v1'
  }

  async generatePitch(skill, experience, specialties) {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a professional freelance pitch writer. Create compelling, personalized pitches for freelancers to use on platforms like Upwork, Fiverr, and Freelancer.'
            },
            {
              role: 'user',
              content: `Create a professional pitch for a ${skill} freelancer with ${experience} of experience. ${specialties ? `They specialize in: ${specialties}.` : ''} The pitch should be concise, compelling, and highlight their value proposition. Keep it under 150 words.`
            }
          ],
          max_tokens: 200,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      return response.data.choices[0].message.content.trim()
    } catch (error) {
      console.error('OpenAI API Error:', error)
      // Fallback to template-based generation
      return this.generateFallbackPitch(skill, experience, specialties)
    }
  }

  generateFallbackPitch(skill, experience, specialties) {
    const templates = {
      'Content Writing': `Hi! I'm a professional content writer with ${experience} of experience creating engaging, SEO-optimized content. I specialize in ${specialties || 'blog posts, articles, and web copy'} that drives results. My writing helps businesses connect with their audience and boost their online presence. Let's discuss how I can help grow your brand through compelling content.`,
      'Web Development': `Hello! I'm a skilled web developer with ${experience} of experience building modern, responsive websites. I'm proficient in ${specialties || 'React, JavaScript, and modern web technologies'} and focus on creating user-friendly, performant web applications. I'd love to help bring your vision to life with clean, professional code.`,
      'Graphic Design': `Hi there! I'm a creative graphic designer with ${experience} of experience crafting visually stunning designs. I specialize in ${specialties || 'branding, logos, and marketing materials'} that capture attention and communicate your message effectively. Let me help elevate your brand with professional, eye-catching designs.`,
      'Social Media Marketing': `Hello! I'm a social media marketing specialist with ${experience} of experience growing brands online. I excel at ${specialties || 'content creation, community management, and paid advertising'} across all major platforms. I'll help increase your engagement, followers, and conversions through strategic social media campaigns.`
    }
    
    return templates[skill] || `Hi! I'm a ${skill.toLowerCase()} specialist with ${experience} of experience. I'm passionate about ${specialties || 'delivering high-quality results'} and would love to help you achieve your goals. Let's connect and discuss how I can add value to your project.`
  }

  async createEmbedding(text) {
    try {
      const response = await axios.post(
        `${this.baseURL}/embeddings`,
        {
          model: 'text-embedding-ada-002',
          input: text
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      return response.data.data[0].embedding
    } catch (error) {
      console.error('OpenAI Embeddings API Error:', error)
      throw error
    }
  }
}

// Neynar (Farcaster) Client
class NeynarClient {
  constructor() {
    this.apiKey = API_CONFIG.neynar.key
    this.baseURL = API_CONFIG.neynar.baseUrl
  }

  async request(endpoint, options = {}) {
    try {
      const response = await axios({
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'api_key': this.apiKey,
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      })
      return response.data
    } catch (error) {
      console.error('Neynar API Error:', error)
      throw error
    }
  }

  async getUserByFid(fid) {
    return this.request(`/user/bulk?fids=${fid}`)
  }

  async getUserByCustodyAddress(address) {
    return this.request(`/user/custody-address?custody_address=${address}`)
  }

  async getCasts(fid, limit = 25) {
    return this.request(`/casts?fid=${fid}&limit=${limit}`)
  }

  async publishCast(signerUuid, text, embeds = []) {
    return this.request('/casts', {
      method: 'POST',
      data: {
        signer_uuid: signerUuid,
        text,
        embeds
      }
    })
  }
}

// Payment Client (Stripe integration)
class PaymentClient {
  constructor() {
    this.stripeKey = API_CONFIG.stripe.publishableKey
  }

  async createPaymentIntent(amount, currency = 'usd') {
    try {
      // This would typically call your backend endpoint
      const response = await axios.post('/api/create-payment-intent', {
        amount: Math.round(amount * 100), // Convert to cents
        currency
      })
      
      return response.data
    } catch (error) {
      console.error('Payment API Error:', error)
      throw error
    }
  }

  async processPayment(paymentMethodId, paymentIntentId) {
    try {
      const response = await axios.post('/api/process-payment', {
        payment_method_id: paymentMethodId,
        payment_intent_id: paymentIntentId
      })
      
      return response.data
    } catch (error) {
      console.error('Payment Processing Error:', error)
      throw error
    }
  }
}

// Export API clients
export const supabaseClient = new SupabaseClient()
export const openaiClient = new OpenAIClient()
export const neynarClient = new NeynarClient()
export const paymentClient = new PaymentClient()

// Export API config for environment setup
export { API_CONFIG }
