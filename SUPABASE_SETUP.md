# SUPABASE SERVICE ROLE KEY SETUP INSTRUCTIONS

## Problem
The documents table has RLS (Row Level Security) enabled, which prevents client-side inserts.

## Solution
Add your Supabase Service Role Key to .env.local

## How to Get Your Service Role Key

1. Go to https://app.supabase.com
2. Select your project: jxgslcfowfefasdmykuc
3. Click Settings → API
4. Copy the "service_role" key (NOT the "anon" key)
5. Add to .env.local:
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

## Why This Works
- Client key (anon) is restricted by RLS policies
- Service role key bypasses RLS for server-side operations
- Server actions are secure because they run on the backend only

## After Adding the Key
1. Restart the dev server: npm run dev
2. Try uploading a PDF again
3. Check browser console for success message
