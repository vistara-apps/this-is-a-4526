# GigFlow API Documentation

This document outlines the API integrations and data flow for the GigFlow Base MiniApp.

## Overview

GigFlow integrates with multiple external APIs to provide a comprehensive platform for online earning opportunities. The application uses a client-side architecture with direct API integrations.

## API Integrations

### 1. Supabase (Database & Storage)

**Purpose**: Primary database for storing user data, gigs, skill guides, and transactions.

**Base URL**: `https://your-project.supabase.co`

#### Authentication
```javascript
// Using Supabase client with API key
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
```

#### Key Tables

##### Users Table
```sql
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farcaster_id TEXT UNIQUE,
  wallet_address TEXT,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  saved_gigs JSONB DEFAULT '[]',
  completed_modules JSONB DEFAULT '[]',
  purchased_content JSONB DEFAULT '[]',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

##### Gigs Table
```sql
CREATE TABLE gigs (
  gig_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  source TEXT,
  category TEXT,
  pay_rate TEXT,
  vetted BOOLEAN DEFAULT false,
  posted_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

##### Skill Guides Table
```sql
CREATE TABLE skill_guides (
  guide_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  skill_tag TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 0,
  students_enrolled INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### API Methods

##### Get Gigs
```javascript
const getGigs = async (filters = {}) => {
  let query = supabase.from('gigs').select('*')
  
  if (filters.category) {
    query = query.eq('category', filters.category)
  }
  
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }
  
  const { data, error } = await query.order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}
```

##### Get Skill Guides
```javascript
const getSkillGuides = async (filters = {}) => {
  let query = supabase.from('skill_guides').select('*')
  
  if (filters.isPremium !== undefined) {
    query = query.eq('is_premium', filters.isPremium)
  }
  
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`)
  }
  
  const { data, error } = await query.order('rating', { ascending: false })
  
  if (error) throw error
  return data
}
```

### 2. OpenAI API

**Purpose**: AI-powered pitch generation and content embeddings.

**Base URL**: `https://api.openai.com/v1`

#### Authentication
```javascript
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for client-side usage
})
```

#### Pitch Generation
```javascript
const generatePitch = async (skill, experience, specialties) => {
  const prompt = `Create a professional freelancer pitch for someone with:
  - Skill: ${skill}
  - Experience: ${experience}
  - Specialties: ${specialties.join(', ')}
  
  Make it compelling, specific, and under 150 words.`
  
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 200,
    temperature: 0.7
  })
  
  return response.choices[0].message.content
}
```

#### Content Embeddings
```javascript
const createEmbedding = async (text) => {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text
  })
  
  return response.data[0].embedding
}
```

### 3. Neynar API (Farcaster)

**Purpose**: Farcaster authentication and social features.

**Base URL**: `https://api.neynar.com/v2`

#### Authentication
```javascript
const neynarClient = {
  apiKey: process.env.VITE_NEYNAR_API_KEY,
  baseURL: 'https://api.neynar.com/v2'
}
```

#### User Authentication
```javascript
const authenticateUser = async (fid) => {
  const response = await fetch(`${neynarClient.baseURL}/user/bulk?fids=${fid}`, {
    headers: {
      'accept': 'application/json',
      'api_key': neynarClient.apiKey
    }
  })
  
  const data = await response.json()
  return data.users[0]
}
```

#### Cast Operations
```javascript
const createCast = async (text, parentHash = null) => {
  const response = await fetch(`${neynarClient.baseURL}/casts`, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api_key': neynarClient.apiKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      text,
      parent: parentHash
    })
  })
  
  return response.json()
}
```

### 4. Stripe API

**Purpose**: Fiat payment processing for premium content.

**Base URL**: `https://api.stripe.com/v1`

#### Client-Side Integration
```javascript
import { loadStripe } from '@stripe/stripe-js'

const stripe = await loadStripe(process.env.VITE_STRIPE_PUBLISHABLE_KEY)
```

#### Payment Intent Creation
```javascript
const createPaymentIntent = async (amount, currency = 'usd') => {
  // This would typically be done on your backend
  const response = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: amount * 100, // Convert to cents
      currency
    })
  })
  
  return response.json()
}
```

### 5. Base Network (Crypto Payments)

**Purpose**: USDC payments on Base network.

#### Wagmi Configuration
```javascript
import { createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'

const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http()
  }
})
```

#### USDC Payment
```javascript
const processUSDCPayment = async (amount, recipient) => {
  const { writeContract } = useWriteContract()
  
  return writeContract({
    address: USDC_CONTRACT_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'transfer',
    args: [recipient, parseUnits(amount.toString(), 6)] // USDC has 6 decimals
  })
}
```

## Data Flow

### User Authentication Flow
1. User connects wallet via RainbowKit
2. App checks for existing Farcaster profile
3. If found, authenticate via Neynar API
4. Create or update user record in Supabase
5. Store session data locally

### Gig Discovery Flow
1. Fetch gigs from Supabase with filters
2. Display in paginated feed
3. Track user interactions (views, clicks)
4. Update user preferences based on behavior

### Skill Guide Purchase Flow
1. User selects premium guide
2. Show paywall with payment options
3. Process payment via Stripe or Base USDC
4. Record transaction in Supabase
5. Grant access to premium content

### Pitch Generation Flow
1. User inputs skill and experience data
2. Send request to OpenAI API
3. Generate personalized pitch
4. Allow user to edit and save
5. Store template for future use

## Error Handling

### API Error Responses
```javascript
const handleAPIError = (error) => {
  switch (error.status) {
    case 401:
      return 'Authentication required'
    case 403:
      return 'Access denied'
    case 429:
      return 'Rate limit exceeded'
    case 500:
      return 'Server error'
    default:
      return 'An unexpected error occurred'
  }
}
```

### Retry Logic
```javascript
const retryRequest = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)))
    }
  }
}
```

## Rate Limiting

### API Rate Limits
- **OpenAI**: 3,500 requests/minute
- **Neynar**: 100 requests/minute
- **Stripe**: 100 requests/second
- **Supabase**: 200 requests/second

### Client-Side Rate Limiting
```javascript
const rateLimiter = {
  requests: new Map(),
  
  canMakeRequest(key, limit, window) {
    const now = Date.now()
    const requests = this.requests.get(key) || []
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < window)
    
    if (validRequests.length >= limit) {
      return false
    }
    
    validRequests.push(now)
    this.requests.set(key, validRequests)
    return true
  }
}
```

## Security Considerations

### API Key Management
- Store sensitive keys in environment variables
- Use different keys for development and production
- Rotate keys regularly
- Monitor API usage for anomalies

### Data Validation
```javascript
const validateGigData = (gig) => {
  const schema = {
    title: { required: true, type: 'string', maxLength: 200 },
    description: { required: false, type: 'string', maxLength: 1000 },
    url: { required: true, type: 'string', pattern: /^https?:\/\/.+/ },
    category: { required: true, type: 'string', enum: ['writing', 'design', 'development', 'marketing'] }
  }
  
  return validateSchema(gig, schema)
}
```

### Row Level Security (RLS)
```sql
-- Users can only access their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = user_id);

-- Premium content requires payment verification
CREATE POLICY "Premium content access" ON skill_guides
  FOR SELECT USING (
    NOT is_premium OR 
    auth.uid() IN (
      SELECT user_id FROM user_purchases 
      WHERE guide_id = skill_guides.guide_id
    )
  );
```

## Performance Optimization

### Caching Strategy
```javascript
const cache = new Map()

const getCachedData = async (key, fetchFn, ttl = 300000) => {
  const cached = cache.get(key)
  
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data
  }
  
  const data = await fetchFn()
  cache.set(key, { data, timestamp: Date.now() })
  return data
}
```

### Pagination
```javascript
const getPaginatedGigs = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit
  
  const { data, error, count } = await supabase
    .from('gigs')
    .select('*', { count: 'exact' })
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false })
  
  return {
    data,
    pagination: {
      page,
      limit,
      total: count,
      pages: Math.ceil(count / limit)
    }
  }
}
```

## Monitoring and Analytics

### API Usage Tracking
```javascript
const trackAPIUsage = (endpoint, method, status, duration) => {
  // Send to analytics service
  analytics.track('api_request', {
    endpoint,
    method,
    status,
    duration,
    timestamp: Date.now()
  })
}
```

### Error Logging
```javascript
const logError = (error, context) => {
  console.error('API Error:', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  })
  
  // Send to error tracking service
  errorTracker.captureException(error, { extra: context })
}
```

This documentation provides a comprehensive overview of the API integrations and data flow for the GigFlow application. For specific implementation details, refer to the source code in the `src/services/` directory.
