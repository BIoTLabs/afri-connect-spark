-- Create storage buckets for file sharing
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('chat-files', 'chat-files', false),
  ('voice-messages', 'voice-messages', false);

-- Create policies for chat files
CREATE POLICY "Users can view files in their chats" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'chat-files' 
  AND EXISTS (
    SELECT 1 FROM messages m 
    JOIN chat_participants cp ON m.chat_id = cp.chat_id 
    WHERE m.media_url = (storage.buckets.id || '/' || storage.objects.name) 
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can upload files to their chats" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'chat-files' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their own uploaded files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'chat-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policies for voice messages
CREATE POLICY "Users can view voice messages in their chats" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'voice-messages' 
  AND EXISTS (
    SELECT 1 FROM messages m 
    JOIN chat_participants cp ON m.chat_id = cp.chat_id 
    WHERE m.media_url = (storage.buckets.id || '/' || storage.objects.name) 
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can upload voice messages to their chats" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'voice-messages' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their own voice messages" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'voice-messages' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add realtime for storage objects
ALTER PUBLICATION supabase_realtime ADD TABLE storage.objects;