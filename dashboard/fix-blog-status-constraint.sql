-- Fix Blog Status Constraint and Visibility Logic
-- Run this in your Supabase SQL Editor

-- ========================================
-- 1. UPDATE BLOG STATUS CONSTRAINT
-- ========================================

-- First, ensure all existing blogs have valid status values
UPDATE blogs SET status = 'published' WHERE status IS NULL OR status NOT IN ('draft', 'published');

-- Drop existing constraint if it exists
DO $$ 
BEGIN
    -- Try to drop the constraint if it exists
    BEGIN
        ALTER TABLE blogs DROP CONSTRAINT IF EXISTS blogs_status_check;
    EXCEPTION
        WHEN undefined_object THEN
            -- Constraint doesn't exist, continue
            NULL;
    END;
END $$;

-- Add new constraint to only allow 'draft' and 'published' values
ALTER TABLE blogs ADD CONSTRAINT blogs_status_check 
CHECK (status IN ('draft', 'published'));

-- Set default value for new blogs
ALTER TABLE blogs ALTER COLUMN status SET DEFAULT 'draft';

-- ========================================
-- 2. VERIFY THE CONSTRAINT
-- ========================================

-- Check the constraint was added correctly
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'blogs'::regclass 
AND contype = 'c';

-- Check current blog statuses
SELECT 
    status,
    COUNT(*) as count
FROM blogs 
GROUP BY status 
ORDER BY status;

-- ========================================
-- 3. UPDATE RLS POLICIES FOR PUBLIC VISIBILITY
-- ========================================

-- Enable RLS on blogs table
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view published blogs" ON blogs;
DROP POLICY IF EXISTS "Admin can manage all blogs" ON blogs;

-- Create policy for public to only see published blogs
CREATE POLICY "Public can view published blogs" ON blogs
FOR SELECT USING (status = 'published');

-- Create policy for admin to manage all blogs (draft and published)
CREATE POLICY "Admin can manage all blogs" ON blogs
FOR ALL USING (true) WITH CHECK (true);

-- ========================================
-- 4. VERIFICATION QUERIES
-- ========================================

-- Test the constraint by trying to insert invalid status
-- This should fail:
-- INSERT INTO blogs (title, slug, content, status) VALUES ('Test', 'test', 'content', 'invalid');

-- Test inserting valid statuses (these should work):
-- INSERT INTO blogs (title, slug, content, status) VALUES ('Draft Test', 'draft-test', 'content', 'draft');
-- INSERT INTO blogs (title, slug, content, status) VALUES ('Published Test', 'published-test', 'content', 'published');

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
WHERE tablename = 'blogs';

-- Check RLS status
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'blogs';

-- ========================================
-- 5. FINAL VERIFICATION
-- ========================================

-- Show all blogs (admin view)
SELECT 
    id,
    title,
    slug,
    status,
    created_at
FROM blogs 
ORDER BY created_at DESC;

-- Show only published blogs (public view simulation)
SELECT 
    id,
    title,
    slug,
    status,
    created_at
FROM blogs 
WHERE status = 'published'
ORDER BY created_at DESC;

-- ========================================
-- NOTES
-- ========================================

/*
AFTER RUNNING THIS SCRIPT:

1. The blogs table will only accept 'draft' and 'published' as status values
2. New blogs will default to 'draft' status
3. RLS policies ensure:
   - Public users can only see published blogs
   - Admin users can see and manage all blogs
4. The constraint will prevent invalid status values

TESTING:
1. Try creating a blog with status 'draft' - should work
2. Try creating a blog with status 'published' - should work  
3. Try creating a blog with status 'invalid' - should fail
4. Check that public blog listing only shows published blogs
5. Check that admin dashboard shows all blogs (draft and published)

IF YOU STILL HAVE ISSUES:
1. Check browser console for errors
2. Verify Supabase connection
3. Ensure all SQL commands executed successfully
4. Check RLS policies are working correctly
*/

