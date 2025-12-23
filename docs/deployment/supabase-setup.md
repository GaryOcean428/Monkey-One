# 🗄️ Supabase Setup for Authentication

## 📋 **REQUIRED SUPABASE CONFIGURATION**

Your Supabase database needs to be updated to support the new authentication system.

## 🔧 **Database Schema Updates**

### **1. Update the `profiles` table**

Run this SQL in your Supabase SQL Editor:

```sql
-- Drop existing profiles table if it exists
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create new profiles table with correct schema
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

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_username ON public.profiles(username);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for Row Level Security
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (true); -- Allow all users to read profiles for now

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (true); -- Allow profile creation

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (true); -- Allow profile updates

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
```

### **2. Update the `notes` table (if needed)**

The notes table looks correct, but let's ensure it has proper foreign key relationships:

```sql
-- Add foreign key constraint to notes table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'notes_user_id_fkey'
    ) THEN
        ALTER TABLE public.notes 
        ADD CONSTRAINT notes_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(user_id);
    END IF;
END $$;
```

## 🔐 **Authentication Settings**

### **1. Enable Google OAuth in Supabase (Optional)**

If you want to use Supabase's built-in Google OAuth (in addition to our custom implementation):

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Add your Google OAuth credentials:
   - **Client ID**: `your-google-client-id.apps.googleusercontent.com`
   - **Client Secret**: (from Google Cloud Console)
   - **Redirect URL**: `https://your-project.supabase.co/auth/v1/callback`

**Note**: This is optional since we're using our own Google OAuth implementation.

### **2. Configure Site URL**

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Set **Site URL**: `https://monkey-one.dev`
3. Add **Redirect URLs**:
   ```
   https://monkey-one.dev/**
   https://monkey-one-nine.vercel.app/**
   http://localhost:4000/**
   ```

## 🧪 **Test the Setup**

After running the SQL commands:

1. **Start your app**: `pnpm run dev`
2. **Sign in with Google**: The system will automatically create a profile
3. **Check Supabase**: Go to Table Editor → profiles to see the new user
4. **Test the auth page**: Visit `/auth-test` to verify Supabase sync

## ✅ **Verification Checklist**

- [ ] Profiles table updated with correct schema
- [ ] Indexes created for performance
- [ ] Row Level Security enabled
- [ ] Policies created for data access
- [ ] Updated_at trigger working
- [ ] Site URL configured in Supabase
- [ ] Redirect URLs added
- [ ] Test user profile created successfully

## 🚨 **Important Notes**

1. **Data Migration**: If you have existing profiles, you'll need to migrate the data
2. **RLS Policies**: The current policies are permissive for testing - tighten them for production
3. **Backup**: Always backup your database before running schema changes

## 🔄 **After Setup**

Once you've run the SQL commands:

1. The authentication system will automatically sync Google users to Supabase
2. User profiles will be created with proper schema
3. The `/auth-test` page will show "Supabase: ✅ Synced"
4. All user data will be properly stored and accessible

---

**Run the SQL commands above in your Supabase SQL Editor, then test the authentication flow!**