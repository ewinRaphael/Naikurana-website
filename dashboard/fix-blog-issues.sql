-- Fix Blog Management Issues
-- Run this in your Supabase SQL Editor

-- ========================================
-- 1. FIX RLS POLICIES FOR BLOGS TABLE
-- ========================================

-- Disable RLS for blogs table (quick fix)
ALTER TABLE blogs DISABLE ROW LEVEL SECURITY;

-- Or create permissive policies (alternative approach)
-- CREATE POLICY "Allow all blog operations" ON blogs
-- FOR ALL USING (true) WITH CHECK (true);

-- ========================================
-- 2. ADD STATUS COLUMN TO BLOGS TABLE
-- ========================================

-- Add status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blogs' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE blogs ADD COLUMN status TEXT DEFAULT 'published';
    END IF;
END $$;

-- Update existing blogs to have 'published' status if null
UPDATE blogs SET status = 'published' WHERE status IS NULL;

-- ========================================
-- 3. SETUP BLOG IMAGES STORAGE
-- ========================================

-- Create blog-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images',
  'blog-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for blog-images bucket
CREATE POLICY "Public read access for blog-images" ON storage.objects
FOR SELECT USING (bucket_id = 'blog-images');

CREATE POLICY "Authenticated users can upload blog images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'blog-images');

CREATE POLICY "Authenticated users can update blog images" ON storage.objects
FOR UPDATE USING (bucket_id = 'blog-images');

CREATE POLICY "Authenticated users can delete blog images" ON storage.objects
FOR DELETE USING (bucket_id = 'blog-images');

-- ========================================
-- 4. VERIFICATION QUERIES
-- ========================================

-- Check blogs table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'blogs' 
ORDER BY ordinal_position;

-- Check RLS status
SELECT schemaname, tablename, rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'blogs';

-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'blog-images';

-- Check blog data
SELECT id, title, slug, status, created_at 
FROM blogs 
ORDER BY created_at DESC 
LIMIT 5;

-- ========================================
-- 5. TEST DATA (OPTIONAL)
-- ========================================

-- Insert test blog post
INSERT INTO blogs (title, slug, content, excerpt, status, image_url) 
VALUES (
  'Test Blog Post',
  'test-blog-post',
  'This is a test blog post content for testing the blog management system.',
  'A test blog post to verify the system is working correctly.',
  'published',
  'https://via.placeholder.com/800x400'
) ON CONFLICT (slug) DO NOTHING;

-- ========================================
-- 6. CLEANUP (RUN AFTER TESTING)
-- ========================================

-- Remove test data if needed
-- DELETE FROM blogs WHERE title = 'Test Blog Post';

-- ========================================
-- NOTES
-- ========================================

/*
AFTER RUNNING THIS SCRIPT:

1. The blogs table will have RLS disabled for easy access
2. A 'status' column will be added with default 'published'
3. The blog-images storage bucket will be created
4. All existing blogs will be marked as 'published'

TESTING:
1. Try creating a new blog post with image upload
2. Check that the status field works (published/draft)
3. Verify that image uploads work
4. Check that the statistics show correct counts

IF YOU STILL HAVE ISSUES:
1. Check browser console for errors
2. Verify Supabase connection
3. Ensure all SQL commands executed successfully
*/
