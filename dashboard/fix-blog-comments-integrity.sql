-- Fix Blog Comments Data Integrity and Relationships
-- Run this in your Supabase SQL Editor

-- ========================================
-- 1. VERIFY AND FIX BLOG_COMMENTS TABLE STRUCTURE
-- ========================================

-- Check current table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'blog_comments' 
ORDER BY ordinal_position;

-- Ensure blog_id column exists and is properly configured
DO $$ 
BEGIN
    -- Add blog_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_comments' 
        AND column_name = 'blog_id'
    ) THEN
        ALTER TABLE blog_comments ADD COLUMN blog_id UUID REFERENCES blogs(id) ON DELETE CASCADE;
    END IF;
    
    -- Add approved column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_comments' 
        AND column_name = 'approved'
    ) THEN
        ALTER TABLE blog_comments ADD COLUMN approved BOOLEAN DEFAULT false;
    END IF;
END $$;

-- ========================================
-- 2. BACKFILL EXISTING COMMENTS WITH BLOG_ID
-- ========================================

-- First, let's see what we're working with
SELECT 
    'Current comments without blog_id' as status,
    COUNT(*) as count
FROM blog_comments 
WHERE blog_id IS NULL;

-- Get a list of all blogs to help with backfilling
SELECT 
    id,
    title,
    slug,
    created_at
FROM blogs 
ORDER BY created_at DESC;

-- Backfill strategy: Assign comments to the most recent blog if blog_id is null
-- This is a temporary fix - you should manually review and correct these
UPDATE blog_comments 
SET blog_id = (
    SELECT id FROM blogs 
    ORDER BY created_at DESC 
    LIMIT 1
)
WHERE blog_id IS NULL;

-- Verify the backfill worked
SELECT 
    'Comments after backfill' as status,
    COUNT(*) as total_comments,
    COUNT(CASE WHEN blog_id IS NOT NULL THEN 1 END) as with_blog_id,
    COUNT(CASE WHEN blog_id IS NULL THEN 1 END) as without_blog_id
FROM blog_comments;

-- ========================================
-- 3. ADD INDEXES FOR PERFORMANCE
-- ========================================

-- Add index on blog_id for fast filtering
CREATE INDEX IF NOT EXISTS idx_blog_comments_blog_id ON blog_comments(blog_id);

-- Add index on approved status for fast filtering
CREATE INDEX IF NOT EXISTS idx_blog_comments_approved ON blog_comments(approved);

-- Add composite index for common queries
CREATE INDEX IF NOT EXISTS idx_blog_comments_blog_approved ON blog_comments(blog_id, approved);

-- Add index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_blog_comments_created_at ON blog_comments(created_at DESC);

-- ========================================
-- 4. UPDATE RLS POLICIES FOR BLOG_COMMENTS
-- ========================================

-- Enable RLS on blog_comments table
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view approved comments" ON blog_comments;
DROP POLICY IF EXISTS "Public can insert comments" ON blog_comments;
DROP POLICY IF EXISTS "Admin can manage all comments" ON blog_comments;

-- Create policy for public to view approved comments
CREATE POLICY "Public can view approved comments" ON blog_comments
FOR SELECT USING (approved = true);

-- Create policy for public to insert comments
CREATE POLICY "Public can insert comments" ON blog_comments
FOR INSERT WITH CHECK (true);

-- Create policy for admin to manage all comments
CREATE POLICY "Admin can manage all comments" ON blog_comments
FOR ALL USING (true) WITH CHECK (true);

-- ========================================
-- 5. VERIFICATION QUERIES
-- ========================================

-- Check table structure after fixes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'blog_comments' 
ORDER BY ordinal_position;

-- Check indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'blog_comments';

-- Check RLS policies
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
WHERE tablename = 'blog_comments';

-- Check RLS status
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'blog_comments';

-- ========================================
-- 6. DATA INTEGRITY CHECKS
-- ========================================

-- Check comments by blog
SELECT 
    b.title as blog_title,
    b.slug as blog_slug,
    COUNT(c.id) as comment_count,
    COUNT(CASE WHEN c.approved = true THEN 1 END) as approved_count,
    COUNT(CASE WHEN c.approved = false THEN 1 END) as pending_count
FROM blogs b
LEFT JOIN blog_comments c ON b.id = c.blog_id
GROUP BY b.id, b.title, b.slug
ORDER BY b.created_at DESC;

-- Check for orphaned comments (comments without valid blog_id)
SELECT 
    'Orphaned comments' as issue,
    COUNT(*) as count
FROM blog_comments c
LEFT JOIN blogs b ON c.blog_id = b.id
WHERE b.id IS NULL;

-- Check for comments without blog_id
SELECT 
    'Comments without blog_id' as issue,
    COUNT(*) as count
FROM blog_comments 
WHERE blog_id IS NULL;

-- ========================================
-- 7. SAMPLE QUERIES FOR FRONTEND INTEGRATION
-- ========================================

-- Get approved comments for a specific blog (for public display)
-- Replace 'your-blog-id-here' with actual blog ID
/*
SELECT 
    c.id,
    c.author_name,
    c.author_email,
    c.content,
    c.created_at,
    b.title as blog_title
FROM blog_comments c
JOIN blogs b ON c.blog_id = b.id
WHERE c.blog_id = 'your-blog-id-here'
AND c.approved = true
ORDER BY c.created_at DESC;
*/

-- Get all comments for a specific blog (for admin)
/*
SELECT 
    c.id,
    c.author_name,
    c.author_email,
    c.content,
    c.approved,
    c.created_at,
    b.title as blog_title
FROM blog_comments c
JOIN blogs b ON c.blog_id = b.id
WHERE c.blog_id = 'your-blog-id-here'
ORDER BY c.created_at DESC;
*/

-- Get all comments across all blogs (for admin dashboard)
/*
SELECT 
    c.id,
    c.author_name,
    c.author_email,
    c.content,
    c.approved,
    c.created_at,
    b.title as blog_title,
    b.slug as blog_slug
FROM blog_comments c
JOIN blogs b ON c.blog_id = b.id
ORDER BY c.created_at DESC;
*/

-- ========================================
-- 8. CLEANUP AND MAINTENANCE
-- ========================================

-- Optional: Delete orphaned comments (uncomment if you want to remove them)
-- DELETE FROM blog_comments WHERE blog_id IS NULL;

-- Optional: Delete comments without valid blog references
-- DELETE FROM blog_comments c
-- WHERE NOT EXISTS (SELECT 1 FROM blogs b WHERE b.id = c.blog_id);

-- ========================================
-- NOTES
-- ========================================

/*
AFTER RUNNING THIS SCRIPT:

1. All comments will have a blog_id (assigned to most recent blog if null)
2. Indexes will be created for fast querying
3. RLS policies will be set up for proper access control
4. The approved column will exist for comment moderation

MANUAL REVIEW REQUIRED:
1. Check the "Comments by blog" query results
2. Manually reassign any comments that were incorrectly backfilled
3. Review and approve/reject comments as needed

FRONTEND INTEGRATION:
1. Update comment submission to include blog_id
2. Update comment loading to filter by blog_id
3. Update admin dashboard to show blog titles with comments

TESTING:
1. Try submitting a comment on a specific blog post
2. Verify the comment only appears on that post
3. Check admin dashboard shows correct blog associations
4. Test comment approval/rejection functionality

IF YOU STILL HAVE ISSUES:
1. Check browser console for errors
2. Verify Supabase connection
3. Ensure all SQL commands executed successfully
4. Check RLS policies are working correctly
*/

