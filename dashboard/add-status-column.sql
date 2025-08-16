-- Add Status Column to Blogs Table
-- Run this in your Supabase SQL Editor

-- Add status column to blogs table
ALTER TABLE blogs ADD COLUMN status TEXT DEFAULT 'published';

-- Update existing blogs to have 'published' status
UPDATE blogs SET status = 'published' WHERE status IS NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'blogs' 
ORDER BY ordinal_position;

-- Check existing blog data
SELECT id, title, slug, status, created_at 
FROM blogs 
ORDER BY created_at DESC 
LIMIT 5;
