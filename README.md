# GigFlow - Your Curated Path to Online Earning

GigFlow is a Base MiniApp that curates legitimate online earning opportunities and provides micro-skill guides for individuals seeking to earn money online.

## 🚀 Features

### Core Features
- **Curated Gigs Feed**: Daily/weekly digest of vetted, legitimate online jobs and freelance gigs
- **Micro-Skill Guides**: Short, actionable guides on in-demand skills with premium content
- **Profile Optimizer**: AI-powered tool to create compelling profiles and pitches for freelance platforms

### Technical Features
- **Farcaster Authentication**: Seamless login with Farcaster identity
- **Dual Payment System**: Support for both crypto (USDC on Base) and fiat payments
- **Real-time Data**: Live gig feeds and skill guide updates
- **Responsive Design**: Optimized for mobile and desktop
- **Base MiniApp**: Native integration with Base ecosystem

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Blockchain**: Base, Wagmi, RainbowKit
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-3.5 Turbo for pitch generation
- **Authentication**: Farcaster via Neynar API
- **Payments**: Stripe (fiat) + Base USDC (crypto)
- **Deployment**: Docker, Vercel-ready

## 📋 Prerequisites

Before setting up GigFlow, ensure you have:

- Node.js 18+ and npm/yarn
- A Supabase account and project
- OpenAI API key
- Neynar API key (for Farcaster)
- Stripe account (for fiat payments)
- WalletConnect project ID

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/vistara-apps/this-is-a-4526.git
cd this-is-a-4526
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Fill in your environment variables in `.env`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenAI Configuration
VITE_OPENAI_API_KEY=your-openai-api-key

# Neynar (Farcaster) Configuration
VITE_NEYNAR_API_KEY=your-neynar-api-key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# WalletConnect Project ID
VITE_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the SQL schema from `src/services/database.sql` in your Supabase SQL editor
3. Enable Row Level Security (RLS) policies
4. Configure authentication providers if needed

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see your app running!

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── AppShell.jsx    # Main app layout
│   ├── GigsPage.jsx    # Gigs feed page
│   ├── SkillGuidesPage.jsx # Skill guides page
│   ├── ProfileOptimizerPage.jsx # Profile optimizer
│   ├── GigCard.jsx     # Individual gig display
│   ├── SkillCard.jsx   # Individual skill guide display
│   └── Paywall.jsx     # Payment modal
├── contexts/           # React contexts
│   └── AuthContext.jsx # Authentication context
├── hooks/              # Custom React hooks
│   ├── usePayments.js  # Payment processing
│   └── usePaymentContext.js # Base payment context
├── services/           # API services
│   ├── api.js          # Main API clients
│   └── database.sql    # Database schema
└── styles/             # CSS and styling
```

## 🔧 Configuration

### API Services Configuration

The app integrates with multiple APIs. Configure each in `src/services/api.js`:

#### Supabase (Database)
- Handles user data, gigs, skill guides, and transactions
- Provides real-time subscriptions and RLS security

#### OpenAI (AI Features)
- Generates personalized pitches for freelancers
- Creates embeddings for content search and matching

#### Neynar (Farcaster)
- Authenticates users via Farcaster
- Fetches user profiles and social data

#### Stripe (Payments)
- Processes fiat payments for premium content
- Handles subscription management

### Payment Methods

GigFlow supports dual payment options:

1. **Crypto Payments**: USDC on Base network
   - Lower fees (1% + $0.001)
   - Instant settlement
   - Web3 native experience

2. **Fiat Payments**: Credit/debit cards via Stripe
   - Traditional payment experience
   - Higher fees (2.9% + $0.30)
   - Broader accessibility

## 🎨 Design System

GigFlow uses a custom design system built with Tailwind CSS:

### Colors
- **Primary**: `hsl(240 96% 47%)` - Blue for main actions
- **Accent**: `hsl(176 87% 42%)` - Teal for highlights
- **Background**: `hsl(210 40% 96%)` - Light gray
- **Surface**: `hsl(0 0% 100%)` - White for cards

### Components
- **AppShell**: Main layout with navigation
- **GigCard**: Displays individual gig opportunities
- **SkillCard**: Shows skill guides with premium indicators
- **Paywall**: Handles premium content purchases

## 🔐 Security

### Authentication
- Farcaster-based authentication via Neynar
- Wallet-based identity verification
- Session management with secure tokens

### Payments
- PCI-compliant payment processing
- Secure API key management
- Transaction logging and audit trails

### Data Protection
- Row Level Security (RLS) in Supabase
- Encrypted API communications
- User data privacy controls

## 📱 Base MiniApp Features

GigFlow is designed as a Base MiniApp with:

### Frame Actions
- **View Gig Details**: Direct links to external job postings
- **Read Free Skill Guide**: Access to free educational content
- **Initiate Premium Content Purchase**: Seamless payment flow

### Notifications
- New curated gigs matching user preferences
- Milestone achievements (completed guides)
- Premium content updates

### Social Integration
- Share achievements on Farcaster
- Social proof through completion badges
- Community-driven content curation

## 🚀 Deployment

### Docker Deployment

```bash
# Build the Docker image
docker build -t gigflow .

# Run the container
docker run -p 3000:3000 gigflow
```

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

Ensure all environment variables are set in your production environment:

- Database URLs and keys
- API keys for external services
- Payment processor credentials
- Domain and CORS settings

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

## 📊 Analytics and Monitoring

GigFlow includes built-in analytics for:

- User engagement metrics
- Gig click-through rates
- Skill guide completion rates
- Payment conversion rates
- Error tracking and performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in this repository
- Join our Discord community
- Email: support@gigflow.app

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core gig curation system
- ✅ Skill guide platform
- ✅ AI-powered pitch generation
- ✅ Dual payment system

### Phase 2 (Next)
- [ ] Advanced filtering and search
- [ ] User-generated content
- [ ] Referral system
- [ ] Mobile app

### Phase 3 (Future)
- [ ] AI-powered gig matching
- [ ] Skill assessment tools
- [ ] Community features
- [ ] Enterprise solutions

---

Built with ❤️ for the freelance community on Base
