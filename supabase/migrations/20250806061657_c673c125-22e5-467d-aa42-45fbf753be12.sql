-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('chat-files', 'chat-files', true),
  ('voice-messages', 'voice-messages', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for chat-files bucket
CREATE POLICY "Allow authenticated users to upload chat files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'chat-files' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to view chat files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'chat-files' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to delete their own chat files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'chat-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for voice-messages bucket
CREATE POLICY "Allow authenticated users to upload voice messages"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'voice-messages' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to view voice messages"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'voice-messages' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to delete their own voice messages"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'voice-messages' AND
  auth.uid()::text = (storage.foldername(name))[1]
);