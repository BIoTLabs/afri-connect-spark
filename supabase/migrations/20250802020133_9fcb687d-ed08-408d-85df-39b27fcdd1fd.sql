-- Let's completely recreate the chats RLS policies with a different approach
-- First, drop all existing policies on chats table
DROP POLICY IF EXISTS "Users can create chats" ON public.chats;
DROP POLICY IF EXISTS "Users can view chats they participate in" ON public.chats;
DROP POLICY IF EXISTS "Users can update chats they created or participate in" ON public.chats;

-- Create new policies that should work correctly
CREATE POLICY "Users can create chats" 
ON public.chats 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);

CREATE POLICY "Users can view chats they participate in" 
ON public.chats 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND public.is_chat_participant(id, auth.uid()));

CREATE POLICY "Users can update chats they created or participate in" 
ON public.chats 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND (auth.uid() = created_by OR public.is_chat_participant(id, auth.uid())));