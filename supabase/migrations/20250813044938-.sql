-- Tighten profiles SELECT RLS to prevent exposing names/phones to all users
-- 1) Remove overly-permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- 2) Allow users to view only their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- 3) Allow users to view profiles of people they share a chat with
-- This preserves chat functionality (showing participant names/avatars)
CREATE POLICY "Users can view profiles of people they share a chat with"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.chat_participants cp_self
    JOIN public.chat_participants cp_target
      ON cp_self.chat_id = cp_target.chat_id
    WHERE cp_self.user_id = auth.uid()
      AND cp_target.user_id = public.profiles.user_id
  )
);
