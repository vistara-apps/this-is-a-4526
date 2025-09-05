-- GigFlow Database Schema for Supabase
-- This file contains the SQL schema for all tables and relationships

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farcaster_id VARCHAR(255) UNIQUE NOT NULL,
    wallet_address VARCHAR(255),
    username VARCHAR(255),
    display_name VARCHAR(255),
    bio TEXT,
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gigs table
CREATE TABLE gigs (
    gig_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    url TEXT NOT NULL,
    source VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    pay_rate VARCHAR(100),
    vetted BOOLEAN DEFAULT false,
    posted_date DATE NOT NULL,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    embedding VECTOR(1536), -- For OpenAI embeddings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skill Guides table
CREATE TABLE skill_guides (
    guide_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    skill_tag VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) DEFAULT 0.00,
    is_premium BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_ratings INTEGER DEFAULT 0,
    students_enrolled INTEGER DEFAULT 0,
    author_id UUID REFERENCES users(user_id),
    embedding VECTOR(1536), -- For OpenAI embeddings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pitch Templates table
CREATE TABLE pitch_templates (
    template_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    skill_tag VARCHAR(100) NOT NULL,
    use_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved Gigs (Many-to-Many relationship)
CREATE TABLE saved_gigs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    gig_id UUID REFERENCES gigs(gig_id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, gig_id)
);

-- Completed Modules (Many-to-Many relationship)
CREATE TABLE completed_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    guide_id UUID REFERENCES skill_guides(guide_id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress_percentage INTEGER DEFAULT 100,
    UNIQUE(user_id, guide_id)
);

-- Purchased Content (Many-to-Many relationship)
CREATE TABLE purchased_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    guide_id UUID REFERENCES skill_guides(guide_id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- 'crypto' or 'fiat'
    transaction_hash VARCHAR(255), -- For crypto payments
    stripe_payment_intent_id VARCHAR(255), -- For fiat payments
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, guide_id)
);

-- User Preferences table
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE UNIQUE,
    preferred_categories TEXT[], -- Array of preferred gig categories
    skill_level VARCHAR(50) DEFAULT 'beginner', -- beginner, intermediate, advanced
    notification_settings JSONB DEFAULT '{"new_gigs": true, "guide_updates": true, "milestones": true}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gig Applications/Clicks tracking
CREATE TABLE gig_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    gig_id UUID REFERENCES gigs(gig_id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL, -- 'view', 'click', 'apply'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Guide Ratings
CREATE TABLE guide_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    guide_id UUID REFERENCES skill_guides(guide_id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, guide_id)
);

-- Indexes for better performance
CREATE INDEX idx_users_farcaster_id ON users(farcaster_id);
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_gigs_category ON gigs(category);
CREATE INDEX idx_gigs_posted_date ON gigs(posted_date DESC);
CREATE INDEX idx_gigs_vetted ON gigs(vetted);
CREATE INDEX idx_skill_guides_skill_tag ON skill_guides(skill_tag);
CREATE INDEX idx_skill_guides_is_premium ON skill_guides(is_premium);
CREATE INDEX idx_skill_guides_rating ON skill_guides(rating DESC);
CREATE INDEX idx_saved_gigs_user_id ON saved_gigs(user_id);
CREATE INDEX idx_completed_modules_user_id ON completed_modules(user_id);
CREATE INDEX idx_purchased_content_user_id ON purchased_content(user_id);
CREATE INDEX idx_gig_interactions_user_id ON gig_interactions(user_id);
CREATE INDEX idx_gig_interactions_gig_id ON gig_interactions(gig_id);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchased_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE gig_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_ratings ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Saved gigs policies
CREATE POLICY "Users can view own saved gigs" ON saved_gigs FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own saved gigs" ON saved_gigs FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own saved gigs" ON saved_gigs FOR DELETE USING (auth.uid()::text = user_id::text);

-- Completed modules policies
CREATE POLICY "Users can view own completed modules" ON completed_modules FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own completed modules" ON completed_modules FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Purchased content policies
CREATE POLICY "Users can view own purchases" ON purchased_content FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own purchases" ON purchased_content FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON user_preferences FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own preferences" ON user_preferences FOR ALL USING (auth.uid()::text = user_id::text);

-- Gig interactions policies
CREATE POLICY "Users can view own interactions" ON gig_interactions FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own interactions" ON gig_interactions FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Guide ratings policies
CREATE POLICY "Users can view all ratings" ON guide_ratings FOR SELECT TO authenticated;
CREATE POLICY "Users can insert own ratings" ON guide_ratings FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own ratings" ON guide_ratings FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Public read access for gigs, skill_guides, and pitch_templates
CREATE POLICY "Anyone can view gigs" ON gigs FOR SELECT TO authenticated;
CREATE POLICY "Anyone can view skill guides" ON skill_guides FOR SELECT TO authenticated;
CREATE POLICY "Anyone can view pitch templates" ON pitch_templates FOR SELECT TO authenticated;

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gigs_updated_at BEFORE UPDATE ON gigs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_skill_guides_updated_at BEFORE UPDATE ON skill_guides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pitch_templates_updated_at BEFORE UPDATE ON pitch_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update guide ratings
CREATE OR REPLACE FUNCTION update_guide_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE skill_guides 
    SET 
        rating = (
            SELECT ROUND(AVG(rating)::numeric, 2) 
            FROM guide_ratings 
            WHERE guide_id = NEW.guide_id
        ),
        total_ratings = (
            SELECT COUNT(*) 
            FROM guide_ratings 
            WHERE guide_id = NEW.guide_id
        )
    WHERE guide_id = NEW.guide_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update guide ratings
CREATE TRIGGER update_guide_rating_trigger 
    AFTER INSERT OR UPDATE ON guide_ratings 
    FOR EACH ROW EXECUTE FUNCTION update_guide_rating();

-- Sample data for development
INSERT INTO gigs (title, description, url, source, category, pay_rate, vetted, posted_date) VALUES
('Senior React Developer', 'Build scalable web applications using React, TypeScript, and Node.js. Remote position with flexible hours.', 'https://upwork.com/job/react-dev-001', 'Upwork', 'development', '$50-80/hour', true, '2024-01-15'),
('Content Writer - Tech Blog', 'Create engaging technical content for AI and blockchain topics. Must have strong writing skills and technical knowledge.', 'https://freelancer.com/job/content-writer-002', 'Freelancer', 'writing', '$25-45/hour', true, '2024-01-14'),
('UI/UX Designer', 'Design modern user interfaces for mobile and web applications. Experience with Figma required.', 'https://99designs.com/job/ui-designer-003', '99designs', 'design', '$35-60/hour', true, '2024-01-13'),
('Social Media Manager', 'Manage social media accounts for e-commerce brands. Create content and engage with followers.', 'https://fiverr.com/gig/social-media-004', 'Fiverr', 'marketing', '$20-35/hour', true, '2024-01-12'),
('Python Data Analyst', 'Analyze large datasets and create visualizations. Experience with pandas, numpy, and matplotlib required.', 'https://upwork.com/job/python-analyst-005', 'Upwork', 'development', '$40-65/hour', true, '2024-01-11');

INSERT INTO skill_guides (title, content, skill_tag, price, is_premium, rating, total_ratings, students_enrolled) VALUES
('Complete Freelance Writing Guide', 'Learn how to start your freelance writing career from scratch. This comprehensive guide covers finding clients, setting competitive rates, building a strong portfolio, and scaling your business. Includes templates, pitch examples, and client communication strategies.', 'writing', 0.00, false, 4.8, 156, 1250),
('React Development Mastery', 'Master React development with hands-on projects and real-world examples. Learn hooks, context, state management, testing, and deployment. Build 5 complete applications from scratch.', 'development', 1.50, true, 4.9, 89, 890),
('Social Media Marketing Secrets', 'Discover proven strategies to grow social media accounts organically and monetize your following. Covers content creation, hashtag strategies, engagement tactics, and influencer partnerships.', 'marketing', 0.00, false, 4.6, 210, 2100),
('Advanced UI/UX Design', 'Take your design skills to the next level with advanced techniques, design systems, and user research methods. Learn to create designs that convert and delight users.', 'design', 2.00, true, 4.9, 56, 560),
('Email Marketing Automation', 'Build automated email sequences that convert leads into customers. Learn segmentation, personalization, A/B testing, and advanced automation workflows.', 'marketing', 1.00, true, 4.7, 34, 340),
('Python for Beginners', 'Start your programming journey with Python. Perfect for complete beginners with no coding experience. Learn syntax, data structures, functions, and build real projects.', 'development', 0.00, false, 4.5, 320, 3200);

INSERT INTO pitch_templates (title, content, skill_tag) VALUES
('Content Writer Pitch', 'Hi! I''m a professional content writer with [X years] of experience creating engaging, SEO-optimized content. I specialize in [your niche] and have helped businesses increase their organic traffic by up to 300%. My writing style is conversational yet informative, perfect for connecting with your target audience. I''d love to help grow your brand through compelling content that drives results.', 'writing'),
('Web Developer Pitch', 'Hello! I''m a skilled web developer with [X years] of experience building modern, responsive websites and web applications. I''m proficient in [your tech stack] and focus on creating user-friendly, performant solutions. I follow best practices for clean code, security, and scalability. Let''s discuss how I can bring your vision to life with professional, high-quality development.', 'development'),
('Graphic Designer Pitch', 'Hi there! I''m a creative graphic designer with [X years] of experience crafting visually stunning designs that capture attention and communicate messages effectively. I specialize in [your specialties] and have worked with clients ranging from startups to Fortune 500 companies. My designs don''t just look great – they drive results and help businesses stand out in competitive markets.', 'design'),
('Social Media Manager Pitch', 'Hello! I''m a social media marketing specialist with [X years] of experience growing brands online. I excel at creating engaging content, building communities, and running successful ad campaigns across all major platforms. I''ve helped clients increase their followers by [X]% and boost engagement rates by [X]%. Let''s discuss how I can help amplify your brand''s voice and reach your target audience.', 'marketing');
