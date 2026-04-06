
-- Add new columns to students table
ALTER TABLE public.students 
  ADD COLUMN IF NOT EXISTS joining_date date DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS parent_contact text,
  ADD COLUMN IF NOT EXISTS alt_contact text;

-- Create attendance_records table for daily tracking
CREATE TABLE public.attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text NOT NULL DEFAULT 'absent' CHECK (status IN ('absent', 'leave')),
  reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (student_id, date)
);

-- Enable RLS
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Admin can manage attendance
CREATE POLICY "Admins can manage attendance" ON public.attendance_records
  FOR ALL TO public
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Students can view own attendance
CREATE POLICY "Students can view own attendance" ON public.attendance_records
  FOR SELECT TO public
  USING (EXISTS (
    SELECT 1 FROM students WHERE students.id = attendance_records.student_id AND students.user_id = auth.uid()
  ));
