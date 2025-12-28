-- Campus.mojo Database Initialization
-- This script runs on first PostgreSQL container start

-- Create LMS schema for our custom API
CREATE SCHEMA IF NOT EXISTS lms;

-- Grant permissions
GRANT ALL ON SCHEMA lms TO campus;

-- Note: LMS tables are managed by Prisma migrations
-- Directus uses the public schema by default

