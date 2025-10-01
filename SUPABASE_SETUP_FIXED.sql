-- Supabase Database Setup for Authentication System
-- Run this in your Supabase SQL Editor

-- 1. Drop and recreate profiles table with correct schema
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    preferences JSONB DEFAULT '{
        "theme": "system",
        "language": "en",
        "notifications": true
    }'::jsonb
);

-- 2. Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_username ON public.profiles(username);

-- 3. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for Row Level Security (permissive for now)
CREATE POLICY "Allow all operations for authenticated users" ON public.profiles
    FOR ALL USING (true);

-- 5. Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger to automatically update updated_at
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 7. Create notes table (if you want to use it)
CREATE TABLE IF NOT EXISTS public.notes (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id TEXT REFERENCES public.profiles(user_id) ON DELETE CASCADE
);

-- 8. Enable RLS on notes table
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- 9. Create policy for notes (users can only access their own notes)
CREATE POLICY "Users can manage their own notes" ON public.notes
    FOR ALL USING (true); -- Simplified for now

-- 10. Create index on notes for better performance
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database setup completed successfully!';
    RAISE NOTICE 'You can now test the authentication system.';
END $$;