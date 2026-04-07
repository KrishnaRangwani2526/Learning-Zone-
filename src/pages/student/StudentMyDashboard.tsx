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
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";

interface StudentRecord {
  id: string;
  name: string;
  course: string;
  attendance: number;
  joining_date: string | null;
}

interface TestMark {
  id: string;
  test_name: string;
  marks: number;
  total: number;
  test_date: string | null;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  reason: string | null;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const StudentMyDashboard = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [testMarks, setTestMarks] = useState<TestMark[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("all");

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      let { data } = await supabase.from("students").select("*").eq("user_id", user.id).maybeSingle();
      if (!data) {
        const res = await supabase.from("students").select("*").eq("email", user.email).maybeSingle();
        data = res.data;
      }
      if (data) {
        setStudent(data as any);
        const [marksRes, attRes] = await Promise.all([
          supabase.from("test_marks").select("*").eq("student_id", data.id).order("created_at"),
          supabase.from("attendance_records").select("*").eq("student_id", data.id).order("date", { ascending: false }),
        ]);
        if (marksRes.data) setTestMarks(marksRes.data as any);
        if (attRes.data) setAttendanceRecords(attRes.data);
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  // Get month-wise attendance data from joining_date
  const getMonthlyAttendance = () => {
    if (!student?.joining_date) return [];
    const start = new Date(student.joining_date);
    const today = new Date();
    const months: { month: string; year: number; present: number; absent: number; leave: number; total: number; percent: number }[] = [];

    const d = new Date(start.getFullYear(), start.getMonth(), 1);
    while (d <= today) {
      const year = d.getFullYear();
      const monthIdx = d.getMonth();
      const monthName = MONTHS[monthIdx];
      
      // Count working days in this month (from joining_date if first month, to today if current month)
      const monthStart = new Date(year, monthIdx, 1);
      const monthEnd = new Date(year, monthIdx + 1, 0);
      const effectiveStart = monthStart < start ? start : monthStart;
      const effectiveEnd = monthEnd > today ? today : monthEnd;
      
      let totalDays = 0;
      const iter = new Date(effectiveStart);
      while (iter <= effectiveEnd) {
        if (iter.getDay() !== 0) totalDays++;
        iter.setDate(iter.getDate() + 1);
      }

      // Count absences/leaves in this month
      const monthRecords = attendanceRecords.filter((r) => {
        const rd = new Date(r.date);
        return rd.getMonth() === monthIdx && rd.getFullYear() === year;
      });
      const absentDays = monthRecords.filter((r) => r.status === "absent").length;
      const leaveDays = monthRecords.filter((r) => r.status === "leave").length;
      const presentDays = Math.max(0, totalDays - absentDays - leaveDays);
      const percent = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

      months.push({
        month: monthName,
        year,
        present: presentDays,
        absent: absentDays,
        leave: leaveDays,
        total: totalDays,
        percent,
      });

      d.setMonth(d.getMonth() + 1);
    }
    return months;
  };

  const monthlyAttendance = getMonthlyAttendance();

  // Overall attendance
  const calcAttendance = () => {
    if (monthlyAttendance.length === 0) return 0;
    const totalDays = monthlyAttendance.reduce((s, m) => s + m.total, 0);
    const absentDays = monthlyAttendance.reduce((s, m) => s + m.absent, 0);
    const leaveDays = monthlyAttendance.reduce((s, m) => s + m.leave, 0);
    if (totalDays === 0) return 100;
    return Math.max(0, Math.min(100, Math.round(((totalDays - absentDays - leaveDays) / totalDays) * 100)));
  };

  const attendancePercent = calcAttendance();

  const avgMarks = testMarks.length > 0
    ? testMarks.reduce((sum, t) => sum + (t.marks / t.total) * 100, 0) / testMarks.length
    : 0;

  // Filter attendance records by selected month
  const filteredAttendanceRecords = selectedMonth === "all"
    ? attendanceRecords
    : attendanceRecords.filter((r) => {
        const d = new Date(r.date);
        return MONTHS[d.getMonth()] === selectedMonth;
      });

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
                  <div><p className="text-sm text-muted-foreground">Overall Attendance</p><p className="text-2xl font-bold text-foreground">{attendancePercent}%</p></div>
                </div>
                <Progress value={attendancePercent} className="mt-3" />
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

          {/* Month-wise Attendance Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Attendance Overview</CardTitle></CardHeader>
              <CardContent className="flex items-center justify-center">
                <ChartContainer config={{ attendance: { label: "Attendance", color: "hsl(var(--primary))" } }} className="h-[250px] w-[250px]">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" startAngle={90} endAngle={-270} data={[{ name: "Attendance", value: attendancePercent, fill: "hsl(var(--primary))" }]}>
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar background dataKey="value" cornerRadius={10} />
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-2xl font-bold">{attendancePercent}%</text>
                  </RadialBarChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Month-wise Attendance</CardTitle></CardHeader>
              <CardContent>
                {monthlyAttendance.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6">No attendance data yet.</p>
                ) : (
                  <ChartContainer config={{ percent: { label: "Attendance %", color: "hsl(var(--primary))" } }} className="h-[250px]">
                    <BarChart data={monthlyAttendance.map((m) => ({ name: `${m.month.slice(0, 3)} ${m.year}`, percent: m.percent }))}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" className="text-muted-foreground" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 100]} className="text-muted-foreground" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="percent" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Test Performance Chart */}
          <Card>
            <CardHeader><CardTitle>Test Performance</CardTitle></CardHeader>
            <CardContent>
              {testMarks.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">No test data yet.</p>
              ) : (
                <ChartContainer config={{ percentage: { label: "Score %", color: "hsl(var(--primary))" } }} className="h-[250px]">
                  <BarChart data={testMarks.map((t) => ({ name: t.test_name, percentage: Number(((t.marks / t.total) * 100).toFixed(1)) }))}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" className="text-muted-foreground" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} className="text-muted-foreground" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="percentage" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Month-wise Attendance Records */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle>Absence & Leave Records</CardTitle>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Filter month" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {MONTHS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredAttendanceRecords.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No absence/leave records{selectedMonth !== "all" ? ` for ${selectedMonth}` : ""}.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttendanceRecords.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.date}</TableCell>
                        <TableCell className={r.status === "leave" ? "text-secondary" : "text-destructive"}>{r.status === "leave" ? "Leave" : "Absent"}</TableCell>
                        <TableCell className="text-muted-foreground">{r.reason || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Monthly Attendance Summary Table */}
          {monthlyAttendance.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Monthly Attendance Summary</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Working Days</TableHead>
                      <TableHead className="text-right">Present</TableHead>
                      <TableHead className="text-right">Absent</TableHead>
                      <TableHead className="text-right">Leave</TableHead>
                      <TableHead className="text-right">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyAttendance.map((m, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{m.month} {m.year}</TableCell>
                        <TableCell className="text-right">{m.total}</TableCell>
                        <TableCell className="text-right">{m.present}</TableCell>
                        <TableCell className="text-right text-destructive">{m.absent}</TableCell>
                        <TableCell className="text-right text-secondary">{m.leave}</TableCell>
                        <TableCell className="text-right font-medium">{m.percent}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

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
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Marks</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testMarks.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.test_name}</TableCell>
                        <TableCell className="text-muted-foreground">{t.test_date || "—"}</TableCell>
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
