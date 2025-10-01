# 🔧 Quick Supabase Fix

## ❌ **Error Fixed**

The error occurred because the `notes` table doesn't exist. Here's the corrected setup:

## ✅ **Run This SQL Instead**

**Go to**: Supabase Dashboard → SQL Editor → **New Query**

**Copy and paste this complete SQL**:

```sql
-- Supabase Database Setup for Authentication System

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

-- 4. Create policies for Row Level Security
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

-- 7. Create notes table (optional - for future use)
CREATE TABLE IF NOT EXISTS public.notes (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id TEXT REFERENCES public.profiles(user_id) ON DELETE CASCADE
);

-- 8. Enable RLS on notes table
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- 9. Create policy for notes
CREATE POLICY "Users can manage their own notes" ON public.notes
    FOR ALL USING (true);

-- 10. Create index on notes
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
```

## 🚀 **After Running the SQL**

1. **Click "Run"** in the SQL Editor
2. **You should see**: "Success. No rows returned"
3. **Check Tables**: Go to Table Editor → You should see `profiles` and `notes` tables

## 🧪 **Test Authentication**

Now test the complete flow:

```bash
# Start development server
pnpm run dev

# Visit the app
open http://localhost:4000

# Sign in with Google
# Visit test page
open http://localhost:4000/auth-test
```

## ✅ **Expected Results**

After signing in, you should see:
- ✅ **Google OAuth**: Active
- ✅ **Supabase**: Synced ← This should now work!
- ⚠️ **Vercel OIDC**: Limited (expected in development)
- ○ **GCP Access**: N/A (expected in development)

## 🔍 **Verify in Supabase**

1. **Go to**: Table Editor → `profiles`
2. **You should see**: A new row with your Google user data
3. **Check the data**: email, name, avatar_url should be populated

---

**Run the corrected SQL above and let me know if the authentication works!**