-- Drop the existing overly permissive temporary policies
DROP POLICY IF EXISTS "Temporary - Allow all authenticated users to create chats" ON public.chats;
DROP POLICY IF EXISTS "Temporary - Allow all authenticated users to view chats" ON public.chats;
DROP POLICY IF EXISTS "Temporary - Allow all authenticated users to update chats" ON public.chats;

-- Create secure RLS policies for the chats table
-- Users can only view chats they participate in
CREATE POLICY "Users can view chats they participate in" 
ON public.chats 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants 
    WHERE chat_id = chats.id AND user_id = auth.uid()
  )
);

-- Users can create new chats (this remains permissive as anyone should be able to start conversations)
CREATE POLICY "Authenticated users can create chats" 
ON public.chats 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated'::text);

-- Users can only update chats they participate in
CREATE POLICY "Users can update chats they participate in" 
ON public.chats 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants 
    WHERE chat_id = chats.id AND user_id = auth.uid()
  )
);

-- Users can delete chats they created or participate in
CREATE POLICY "Users can delete chats they participate in" 
ON public.chats 
FOR DELETE 
USING (
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.chat_participants 
    WHERE chat_id = chats.id AND user_id = auth.uid()
  )
);