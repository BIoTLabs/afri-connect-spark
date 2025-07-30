-- Fix the security definer function to include proper search path
CREATE OR REPLACE FUNCTION public.is_chat_participant(chat_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.chat_participants 
    WHERE chat_id = chat_id_param AND user_id = user_id_param
  );
$$;