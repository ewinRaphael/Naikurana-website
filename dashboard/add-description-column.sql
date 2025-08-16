-- Add Description Column to Gallery Images Table
-- Run this in your Supabase SQL Editor if you want to add a description field

-- Add the description column
ALTER TABLE gallery_images 
ADD COLUMN description TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN gallery_images.description IS 'Optional description for gallery images';

-- Update existing records to have a default description
UPDATE gallery_images 
SET description = CONCAT('Image: ', title) 
WHERE description IS NULL;

-- Make the description column optional (nullable)
-- (It's already nullable by default, but this makes it explicit)

-- Verify the change
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'gallery_images' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test insert with description
INSERT INTO gallery_images (title, alt_text, description, image_url) 
VALUES ('Test with Description', 'Test alt', 'This is a test description', 'https://example.com/test.jpg')
ON CONFLICT DO NOTHING;

-- Clean up test data
DELETE FROM gallery_images WHERE title = 'Test with Description';
