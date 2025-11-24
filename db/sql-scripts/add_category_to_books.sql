-- Add category field to books table for Testing storage
ALTER TABLE books ADD COLUMN IF NOT EXISTS category text DEFAULT 'production' CHECK (category IN ('production', 'testing', 'draft', 'archive'));

-- Update existing books to have 'production' category
UPDATE books SET category = 'production' WHERE category IS NULL;

-- Add index for category queries
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_category_user ON books(category, user_id);

-- Add comment
COMMENT ON COLUMN books.category IS 'Category of the book: production (live), testing (test runs), draft (work in progress), archive (completed/old)';
