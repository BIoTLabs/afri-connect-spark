-- Fix the chat_participants RLS policies
DROP POLICY IF EXISTS "Users can add themselves to chats" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can remove themselves from chats" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can view participants of chats they're in" ON public.chat_participants;

-- Create new policies for chat_participants that work correctly
CREATE POLICY "Allow authenticated users to add participants" 
ON public.chat_participants 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view participants" 
ON public.chat_participants 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Users can remove themselves from chats" 
ON public.chat_participants 
FOR DELETE 
USING (auth.uid() = user_id);