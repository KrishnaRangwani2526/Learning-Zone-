import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarCheck, Trophy, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Navbar from "@/components/Navbar";

interface StudentRecord {
  id: string;
  name: string;
  course: string;
  attendance: number;
}

interface TestMark {
  id: string;
  test_name: string;
  marks: number;
  total: number;
}

const StudentMyDashboard = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [testMarks, setTestMarks] = useState<TestMark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      // Find student record linked to this user, or by email
      let { data } = await supabase.from("students").select("*").eq("user_id", user.id).maybeSingle();
      if (!data) {
        const res = await supabase.from("students").select("*").eq("email", user.email).maybeSingle();
        data = res.data;
      }
      if (data) {
        setStudent(data);
        const { data: marks } = await supabase.from("test_marks").select("*").eq("student_id", data.id).order("created_at");
        if (marks) setTestMarks(marks);
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const avgMarks = testMarks.length > 0
    ? testMarks.reduce((sum, t) => sum + (t.marks / t.total) * 100, 0) / testMarks.length
    : 0;

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <p className="text-center text-muted-foreground pt-32">Loading your dashboard...</p>
    </div>
  );

  if (!student) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 text-center text-muted-foreground px-4">
        <p className="text-lg">No student record found for your account.</p>
        <p className="text-sm mt-2">Please contact your admin to add you to the system.</p>
        <Link to="/student/dashboard"><Button variant="outline" className="mt-4">Back to Dashboard</Button></Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center gap-3">
            <Link to="/student/dashboard"><Button variant="ghost" size="icon"><ArrowLeft size={20} /></Button></Link>
            <div>
              <h1 className="text-3xl font-display text-foreground">My Dashboard</h1>
              <p className="text-muted-foreground">Your performance overview</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10"><CalendarCheck className="text-primary" size={22} /></div>
                  <div><p className="text-sm text-muted-foreground">Attendance</p><p className="text-2xl font-bold text-foreground">{student.attendance}%</p></div>
                </div>
                <Progress value={student.attendance} className="mt-3" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-secondary/10"><Trophy className="text-secondary" size={22} /></div>
                  <div><p className="text-sm text-muted-foreground">Avg Score</p><p className="text-2xl font-bold text-foreground">{avgMarks.toFixed(1)}%</p></div>
                </div>
                <Progress value={avgMarks} className="mt-3" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10"><TrendingUp className="text-primary" size={22} /></div>
                  <div><p className="text-sm text-muted-foreground">Course</p><p className="text-2xl font-bold text-foreground">{student.course}</p></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Test Marks</CardTitle></CardHeader>
            <CardContent>
              {testMarks.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">No test marks recorded yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test</TableHead>
                      <TableHead className="text-right">Marks</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testMarks.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.test_name}</TableCell>
                        <TableCell className="text-right">{t.marks}</TableCell>
                        <TableCell className="text-right">{t.total}</TableCell>
                        <TableCell className="text-right">{((t.marks / t.total) * 100).toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentMyDashboard;
