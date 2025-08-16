-- Fix RLS Policies for Dashboard
-- Run this script in your Supabase SQL Editor

-- ========================================
-- GALLERY IMAGES TABLE
-- ========================================

-- First, let's check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'gallery_images';

-- Option 1: Disable RLS completely (quick fix)
ALTER TABLE gallery_images DISABLE ROW LEVEL SECURITY;

-- Option 2: Enable RLS but add permissive policies (recommended)
-- ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Create policies for gallery_images table
-- Allow all operations for gallery_images
CREATE POLICY "Allow all gallery operations" ON gallery_images
FOR ALL USING (true) WITH CHECK (true);

-- Or create specific policies:
-- CREATE POLICY "Allow gallery inserts" ON gallery_images
-- FOR INSERT WITH CHECK (true);

-- CREATE POLICY "Allow gallery selects" ON gallery_images
-- FOR SELECT USING (true);

-- CREATE POLICY "Allow gallery updates" ON gallery_images
-- FOR UPDATE USING (true) WITH CHECK (true);

-- CREATE POLICY "Allow gallery deletes" ON gallery_images
-- FOR DELETE USING (true);

-- ========================================
-- BLOGS TABLE
-- ========================================

-- Check if RLS is enabled for blogs
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'blogs';

-- Option 1: Disable RLS completely (quick fix)
ALTER TABLE blogs DISABLE ROW LEVEL SECURITY;

-- Option 2: Enable RLS but add permissive policies (recommended)
-- ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Create policies for blogs table
-- Allow all operations for blogs
CREATE POLICY "Allow all blog operations" ON blogs
FOR ALL USING (true) WITH CHECK (true);

-- Or create specific policies:
-- CREATE POLICY "Allow blog inserts" ON blogs
-- FOR INSERT WITH CHECK (true);

-- CREATE POLICY "Allow blog selects" ON blogs
-- FOR SELECT USING (true);

-- CREATE POLICY "Allow blog updates" ON blogs
-- FOR UPDATE USING (true) WITH CHECK (true);

-- CREATE POLICY "Allow blog deletes" ON blogs
-- FOR DELETE USING (true);

-- ========================================
-- BLOG COMMENTS TABLE (if exists)
-- ========================================

-- Check if blog_comments table exists and has RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'blog_comments';

-- If blog_comments table exists, disable RLS or add policies
-- ALTER TABLE blog_comments DISABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Allow all comment operations" ON blog_comments
-- FOR ALL USING (true) WITH CHECK (true);

-- ========================================
-- CONSULTATIONS TABLE (if exists)
-- ========================================

-- Check if consultations table exists and has RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'consultations';

-- If consultations table exists, disable RLS or add policies
-- ALTER TABLE consultations DISABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Allow all consultation operations" ON consultations
-- FOR ALL USING (true) WITH CHECK (true);

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check RLS status for all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('gallery_images', 'blogs', 'blog_comments', 'consultations')
ORDER BY tablename;

-- Check existing policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('gallery_images', 'blogs', 'blog_comments', 'consultations')
ORDER BY tablename, policyname;

-- ========================================
-- TEST QUERIES (run these to verify)
-- ========================================

-- Test gallery_images insert
INSERT INTO gallery_images (title, alt_text, description, image_url) 
VALUES ('Test Image', 'Test Alt Text', 'Test Description', 'https://example.com/test.jpg')
ON CONFLICT DO NOTHING;

-- Test blogs insert
INSERT INTO blogs (title, slug, content) 
VALUES ('Test Blog', 'test-blog', 'Test content')
ON CONFLICT DO NOTHING;

-- Clean up test data
-- DELETE FROM gallery_images WHERE title = 'Test Image';
-- DELETE FROM blogs WHERE title = 'Test Blog';

-- ========================================
-- NOTES
-- ========================================

/*
IMPORTANT NOTES:

1. This script provides two approaches:
   - DISABLE ROW LEVEL SECURITY (quick fix)
   - ENABLE RLS with permissive policies (more secure)

2. For production, consider implementing proper authentication:
   - Use Supabase Auth
   - Create user-specific policies
   - Implement role-based access control

3. The current approach allows all operations for simplicity
   - This is suitable for admin dashboards
   - Consider tightening security for public-facing APIs

4. After running this script:
   - Test the dashboard functionality
   - Verify uploads work in gallery
   - Verify blog creation works
   - Check that all CRUD operations function properly

5. If you still have issues:
   - Check the browser console for errors
   - Verify the Supabase connection
   - Ensure the table schemas match expectations
*/
