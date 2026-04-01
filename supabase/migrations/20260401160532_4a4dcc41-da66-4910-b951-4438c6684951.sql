
-- Create storage bucket for content files
INSERT INTO storage.buckets (id, name, public) VALUES ('content-files', 'content-files', true);

-- Allow admins to upload files
CREATE POLICY "Admins can upload content files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'content-files' AND public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete files
CREATE POLICY "Admins can delete content files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'content-files' AND public.has_role(auth.uid(), 'admin'));

-- Allow anyone authenticated to view/download files
CREATE POLICY "Authenticated users can view content files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'content-files');
