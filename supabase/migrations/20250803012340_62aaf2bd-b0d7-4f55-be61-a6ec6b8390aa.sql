-- Temporarily disable RLS and create a simple policy for testing
ALTER TABLE public.chats DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with a very simple policy for testing
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can create chats" ON public.chats;
DROP POLICY IF EXISTS "Users can view chats they participate in" ON public.chats;
DROP POLICY IF EXISTS "Users can update chats they created or participate in" ON public.chats;

-- Create a very permissive temporary policy for testing
CREATE POLICY "Temporary - Allow all authenticated users to create chats" 
ON public.chats 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Temporary - Allow all authenticated users to view chats" 
ON public.chats 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Temporary - Allow all authenticated users to update chats" 
ON public.chats 
FOR UPDATE 
USING (auth.role() = 'authenticated');