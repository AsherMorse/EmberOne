-- Drop tables first (in correct order due to dependencies)
DROP TABLE IF EXISTS history CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Then drop the enum types
DROP TYPE IF EXISTS comment_type CASCADE;
DROP TYPE IF EXISTS priority CASCADE;
DROP TYPE IF EXISTS ticket_status CASCADE;
DROP TYPE IF EXISTS role CASCADE; 