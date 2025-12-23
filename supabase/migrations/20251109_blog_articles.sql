-- Blog Articles table (admin-only content)
CREATE TABLE IF NOT EXISTS blog_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  category TEXT NOT NULL CHECK (category IN ('relationship-tips', 'wedding-planning', 'traditions', 'success-tips', 'announcements')),
  author_name TEXT DEFAULT 'Brahmin Matrimony Team',
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Platform Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'update', 'promotion', 'maintenance')),
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blog_articles_published ON blog_articles(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_articles_category ON blog_articles(category, is_published);
CREATE INDEX IF NOT EXISTS idx_blog_articles_featured ON blog_articles(is_featured, is_published);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active, priority DESC);

-- Enable RLS
ALTER TABLE blog_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Everyone can read published content
CREATE POLICY "Anyone can view published articles" ON blog_articles
  FOR SELECT USING (is_published = true);

CREATE POLICY "Anyone can view active announcements" ON announcements
  FOR SELECT USING (is_active = true AND (ends_at IS NULL OR ends_at > NOW()));

-- Admin policies
CREATE POLICY "Admins can manage articles" ON blog_articles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage announcements" ON announcements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert sample blog articles
INSERT INTO blog_articles (title, slug, excerpt, content, category, is_published, is_featured, published_at) VALUES
(
  '10 Tips for Creating an Attractive Matrimony Profile',
  'tips-attractive-matrimony-profile',
  'Learn how to make your profile stand out and attract the right matches.',
  'Creating an attractive matrimony profile is the first step towards finding your perfect match. Here are 10 essential tips:

1. **Use Recent, Clear Photos** - Upload recent photos that clearly show your face. Include both formal and casual pictures.

2. **Write a Compelling Bio** - Share your personality, interests, and what you''re looking for in a partner.

3. **Be Honest About Yourself** - Authenticity attracts genuine connections.

4. **Highlight Your Values** - Share what matters most to you in life and relationships.

5. **Mention Your Hobbies** - Common interests are great conversation starters.

6. **Keep It Positive** - Focus on what you want, not what you don''t want.

7. **Update Regularly** - Keep your profile fresh and current.

8. **Complete All Sections** - A complete profile shows you''re serious about finding a match.

9. **Be Specific** - Vague descriptions don''t help potential matches understand you.

10. **Proofread** - Check for spelling and grammar errors.',
  'success-tips',
  true,
  true,
  NOW()
),
(
  'Understanding Gotra and Its Importance in Brahmin Marriages',
  'understanding-gotra-brahmin-marriages',
  'A comprehensive guide to Gotra system and why it matters in traditional Brahmin matrimony.',
  'Gotra is a fundamental concept in Hindu tradition, particularly important in Brahmin marriages. Here''s what you need to know:

**What is Gotra?**
Gotra refers to the lineage or clan that traces back to a common ancestor, typically one of the ancient Vedic sages (Rishis).

**The Seven Primary Gotras**
The seven main Gotras are named after the Saptarishis:
- Bharadwaja
- Kashyapa
- Vasishtha
- Gautama
- Jamadagni
- Atri
- Vishwamitra

**Why Same-Gotra Marriages Are Avoided**
In traditional practice, marriages within the same Gotra are avoided because:
- People of the same Gotra are considered siblings
- It maintains genetic diversity
- It preserves ancient traditions

**Modern Perspective**
While respecting traditions, many families today focus on compatibility, values, and mutual respect as primary factors in matchmaking.',
  'traditions',
  true,
  false,
  NOW()
),
(
  'Planning Your Dream Brahmin Wedding: A Complete Guide',
  'planning-brahmin-wedding-guide',
  'Everything you need to know about planning a traditional Brahmin wedding ceremony.',
  'A Brahmin wedding is a beautiful blend of sacred rituals and joyous celebrations. Here''s your complete planning guide:

**Pre-Wedding Rituals**
- Nischayam (Engagement)
- Muhurtham selection
- Invitations and guest list

**Wedding Day Ceremonies**
- Ganapati Puja
- Kanya Daan
- Mangalsutra ceremony
- Saptapadi (Seven Steps)
- Sindoor ceremony

**Post-Wedding Rituals**
- Griha Pravesh
- Reception

**Planning Tips**
1. Book the venue 6-12 months in advance
2. Hire an experienced priest
3. Plan the menu considering dietary preferences
4. Arrange for traditional decorations
5. Coordinate with photographers for ritual coverage

Remember, the most important aspect is the union of two souls with blessings from family and the divine.',
  'wedding-planning',
  true,
  false,
  NOW()
),
(
  'Building a Strong Foundation: Communication in Relationships',
  'communication-in-relationships',
  'Essential communication tips for couples to build lasting relationships.',
  'Effective communication is the cornerstone of any successful relationship. Here are key insights:

**Active Listening**
- Give your full attention
- Don''t interrupt
- Show empathy and understanding

**Express Yourself Clearly**
- Use "I" statements
- Be specific about your feelings
- Avoid blame and criticism

**Handle Conflicts Constructively**
- Stay calm during disagreements
- Focus on the issue, not the person
- Seek solutions together

**Regular Check-ins**
- Schedule time to talk
- Discuss goals and dreams
- Appreciate each other daily

**Non-Verbal Communication**
- Maintain eye contact
- Use positive body language
- Show affection appropriately

Building strong communication takes practice, but it''s the foundation of a happy marriage.',
  'relationship-tips',
  true,
  false,
  NOW()
);

-- Insert sample announcements
INSERT INTO announcements (title, content, type, priority) VALUES
(
  'Welcome to Brahmin Matrimony!',
  'We''re excited to help you find your perfect match. Complete your profile today to get started on your journey to finding your soulmate.',
  'info',
  10
),
(
  'New Feature: Video Dates (V-Dates)',
  'Connect with your matches through our new video dating feature! Schedule a V-Date with your connections and get to know each other better.',
  'update',
  5
);
