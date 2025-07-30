-- Create security definer function to check if user is participant in a chat
CREATE OR REPLACE FUNCTION public.is_chat_participant(chat_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.chat_participants 
    WHERE chat_id = chat_id_param AND user_id = user_id_param
  );
$$;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view participants of chats they're in" ON public.chat_participants;

-- Create new policy using the security definer function
CREATE POLICY "Users can view participants of chats they're in" 
ON public.chat_participants 
FOR SELECT 
USING (public.is_chat_participant(chat_participants.chat_id, auth.uid()));

-- Also update the chats table policy to use the function
DROP POLICY IF EXISTS "Users can view chats they participate in" ON public.chats;

CREATE POLICY "Users can view chats they participate in" 
ON public.chats 
FOR SELECT 
USING (public.is_chat_participant(chats.id, auth.uid()));

-- Update the chats update policy as well
DROP POLICY IF EXISTS "Users can update chats they created or participate in" ON public.chats;

CREATE POLICY "Users can update chats they created or participate in" 
ON public.chats 
FOR UPDATE 
USING (
  (auth.uid() = created_by) OR 
  public.is_chat_participant(chats.id, auth.uid())
);

-- Update messages policy to use the function
DROP POLICY IF EXISTS "Users can view messages in chats they participate in" ON public.messages;

CREATE POLICY "Users can view messages in chats they participate in" 
ON public.messages 
FOR SELECT 
USING (public.is_chat_participant(messages.chat_id, auth.uid()));

-- Update messages insert policy
DROP POLICY IF EXISTS "Users can send messages to chats they participate in" ON public.messages;

CREATE POLICY "Users can send messages to chats they participate in" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  (auth.uid() = sender_id) AND 
  public.is_chat_participant(messages.chat_id, auth.uid())
);