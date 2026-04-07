import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, UserPlus, Save, Users, Trash2, Plus, Eye, EyeOff, CalendarCheck, CalendarOff, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

interface Student {
  id: string;
  name: string;
  email: string;
  course: string;
  attendance: number;
  user_id: string | null;
  joining_date: string | null;
  parent_contact: string | null;
  alt_contact: string | null;
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

const AdminStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [testMarks, setTestMarks] = useState<TestMark[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [newTest, setNewTest] = useState({ testName: "", marks: "", total: "", testDate: new Date().toISOString().split("T")[0] });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: "", email: "", password: "", course: "", joining_date: new Date().toISOString().split("T")[0], parent_contact: "", alt_contact: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addingStudent, setAddingStudent] = useState(false);
  const [courseFilter, setCourseFilter] = useState("all");
  // Absent marking
  const [absentDate, setAbsentDate] = useState(new Date().toISOString().split("T")[0]);
  const [absentReason, setAbsentReason] = useState("");
  // Leave of absence
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [leaveStart, setLeaveStart] = useState("");
  const [leaveEnd, setLeaveEnd] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const { toast } = useToast();

  const courses = Array.from(new Set(students.map((s) => s.course))).sort();
  const filteredStudents = courseFilter === "all" ? students : students.filter((s) => s.course === courseFilter);
  const selected = students.find((s) => s.id === selectedId);

  const fetchStudents = async () => {
    const { data, error } = await supabase.from("students").select("*").order("created_at", { ascending: false });
    if (data) setStudents(data as any);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    setLoading(false);
  };

  const fetchTestMarks = async (studentId: string) => {
    const { data } = await supabase.from("test_marks").select("*").eq("student_id", studentId).order("created_at");
    if (data) setTestMarks(data);
  };

  const fetchAttendance = async (studentId: string) => {
    const { data } = await supabase.from("attendance_records").select("*").eq("student_id", studentId).order("date", { ascending: false });
    if (data) setAttendanceRecords(data);
  };

  useEffect(() => { fetchStudents(); }, []);

  useEffect(() => {
    if (selectedId) {
      fetchTestMarks(selectedId);
      fetchAttendance(selectedId);
    }
  }, [selectedId]);

  // Calculate attendance percentage
  const calcAttendance = (student: Student) => {
    if (!student.joining_date) return 0;
    const start = new Date(student.joining_date);
    const today = new Date();
    // Count weekdays (Mon-Sat) from joining to today
    let totalDays = 0;
    const d = new Date(start);
    while (d <= today) {
      const day = d.getDay();
      if (day !== 0) totalDays++; // exclude Sundays
      d.setDate(d.getDate() + 1);
    }
    if (totalDays === 0) return 100;
    const absentDays = attendanceRecords.filter((r) => r.status === "absent").length;
    const leaveDays = attendanceRecords.filter((r) => r.status === "leave").length;
    const presentDays = totalDays - absentDays - leaveDays;
    return Math.max(0, Math.min(100, Math.round((presentDays / totalDays) * 100)));
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.email || !newStudent.password || !newStudent.course) return;
    if (newStudent.password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setAddingStudent(true);
    try {
      const res = await supabase.functions.invoke("create-student-account", {
        body: {
          email: newStudent.email,
          password: newStudent.password,
          name: newStudent.name,
          course: newStudent.course,
          joining_date: newStudent.joining_date,
          parent_contact: newStudent.parent_contact || null,
          alt_contact: newStudent.alt_contact || null,
        },
      });
      if (res.error || res.data?.error) {
        toast({ title: "Error", description: res.data?.error || res.error?.message, variant: "destructive" });
      } else {
        toast({ title: "Student account created!", description: `Email: ${newStudent.email}` });
        setNewStudent({ name: "", email: "", password: "", course: "", joining_date: new Date().toISOString().split("T")[0], parent_contact: "", alt_contact: "" });
        setShowAddDialog(false);
        fetchStudents();
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setAddingStudent(false);
  };

  const handleDeleteStudent = async (id: string) => {
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (!error) {
      if (selectedId === id) setSelectedId(null);
      fetchStudents();
      toast({ title: "Student removed" });
    }
  };

  const handleMarkAbsent = async () => {
    if (!selectedId || !absentDate) return;
    const { error } = await supabase.from("attendance_records").insert({
      student_id: selectedId,
      date: absentDate,
      status: "absent",
      reason: absentReason || null,
    });
    if (error) {
      if (error.message.includes("duplicate")) {
        toast({ title: "Already marked for this date", variant: "destructive" });
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    } else {
      toast({ title: "Marked absent" });
      setAbsentReason("");
      fetchAttendance(selectedId);
    }
  };

  const handleAddLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !leaveStart || !leaveEnd || !leaveReason) return;
    const start = new Date(leaveStart);
    const end = new Date(leaveEnd);
    if (end < start) {
      toast({ title: "End date must be after start date", variant: "destructive" });
      return;
    }
    // Insert leave records for each day in the range
    const records: { student_id: string; date: string; status: string; reason: string }[] = [];
    const d = new Date(start);
    while (d <= end) {
      if (d.getDay() !== 0) { // skip Sundays
        records.push({
          student_id: selectedId,
          date: d.toISOString().split("T")[0],
          status: "leave",
          reason: leaveReason,
        });
      }
      d.setDate(d.getDate() + 1);
    }
    // Use upsert to handle existing records
    const { error } = await supabase.from("attendance_records").upsert(records, { onConflict: "student_id,date" });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Leave of absence recorded (${records.length} days)` });
      setShowLeaveDialog(false);
      setLeaveStart("");
      setLeaveEnd("");
      setLeaveReason("");
      fetchAttendance(selectedId);
    }
  };

  const handleDeleteAttendance = async (id: string) => {
    await supabase.from("attendance_records").delete().eq("id", id);
    if (selectedId) fetchAttendance(selectedId);
    toast({ title: "Record removed" });
  };

  const handleAddTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !newTest.testName || !newTest.marks || !newTest.total) return;
    const { error } = await supabase.from("test_marks").insert({
      student_id: selectedId,
      test_name: newTest.testName,
      marks: Number(newTest.marks),
      total: Number(newTest.total),
      test_date: newTest.testDate || null,
    });
    if (!error) {
      setNewTest({ testName: "", marks: "", total: "", testDate: new Date().toISOString().split("T")[0] });
      fetchTestMarks(selectedId);
      toast({ title: "Test mark added" });
    }
  };

  const handleDeleteTest = async (id: string) => {
    await supabase.from("test_marks").delete().eq("id", id);
    if (selectedId) fetchTestMarks(selectedId);
  };

  const attendancePercent = selected ? calcAttendance(selected) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Link to="/admin/dashboard">
                <Button variant="ghost" size="icon"><ArrowLeft size={20} /></Button>
              </Link>
              <div>
                <h1 className="text-3xl font-display text-foreground">Student Management</h1>
                <p className="text-muted-foreground">Manage students, attendance, and marks</p>
              </div>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button><Plus size={16} /> Add Student</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Create Student Account</DialogTitle></DialogHeader>
                <form onSubmit={handleAddStudent} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} placeholder="Student name" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Email (Login ID)</Label>
                    <Input type="email" value={newStudent.email} onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })} placeholder="student@email.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} value={newStudent.password} onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })} placeholder="Min 6 characters" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Course</Label>
                    <Input value={newStudent.course} onChange={(e) => setNewStudent({ ...newStudent, course: e.target.value })} placeholder="e.g., JEE Advanced" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Joining Date</Label>
                    <Input type="date" value={newStudent.joining_date} onChange={(e) => setNewStudent({ ...newStudent, joining_date: e.target.value })} required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Parent Contact</Label>
                      <Input type="tel" value={newStudent.parent_contact} onChange={(e) => setNewStudent({ ...newStudent, parent_contact: e.target.value })} placeholder="+91..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Alt. Contact</Label>
                      <Input type="tel" value={newStudent.alt_contact} onChange={(e) => setNewStudent({ ...newStudent, alt_contact: e.target.value })} placeholder="+91..." />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={addingStudent}>
                    {addingStudent ? "Creating account..." : "Create Student Account"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground py-12">Loading students...</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Users size={18} /> Students ({filteredStudents.length})</CardTitle>
                  {courses.length > 1 && (
                    <Select value={courseFilter} onValueChange={setCourseFilter}>
                      <SelectTrigger className="mt-2"><SelectValue placeholder="Filter by course" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Courses</SelectItem>
                        {courses.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                </CardHeader>
                <CardContent className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {filteredStudents.length === 0 && <p className="text-sm text-muted-foreground">No students found.</p>}
                  {filteredStudents.map((s) => (
                    <div key={s.id} className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedId(s.id)}
                        className={`flex-1 text-left px-4 py-3 rounded-lg transition-colors ${
                          selectedId === s.id ? "bg-primary/10 border border-primary/30" : "hover:bg-muted"
                        }`}
                      >
                        <p className="font-medium text-foreground text-sm">{s.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{s.course}</Badge>
                          {s.joining_date && <span className="text-xs text-muted-foreground">Joined: {s.joining_date}</span>}
                        </div>
                      </button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteStudent(s.id)} className="text-destructive hover:text-destructive shrink-0">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="lg:col-span-2 space-y-4">
                {selected ? (
                  <>
                    {/* Student Details */}
                    <Card>
                      <CardHeader><CardTitle>{selected.name} — Details</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium text-foreground">{selected.email}</p></div>
                          <div><p className="text-sm text-muted-foreground">Course</p><p className="font-medium text-foreground">{selected.course}</p></div>
                          <div><p className="text-sm text-muted-foreground">Joining Date</p><p className="font-medium text-foreground">{selected.joining_date || "Not set"}</p></div>
                          <div>
                            <p className="text-sm text-muted-foreground">Parent Contact</p>
                            <p className="font-medium text-foreground flex items-center gap-1">
                              {selected.parent_contact ? <><Phone size={12} /> {selected.parent_contact}</> : "Not set"}
                            </p>
                          </div>
                          {selected.alt_contact && (
                            <div>
                              <p className="text-sm text-muted-foreground">Alt. Contact</p>
                              <p className="font-medium text-foreground flex items-center gap-1"><Phone size={12} /> {selected.alt_contact}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Attendance Section */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2"><CalendarCheck size={18} /> Attendance — {attendancePercent}%</CardTitle>
                          <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm"><CalendarOff size={14} className="mr-1" /> Leave of Absence</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader><DialogTitle>Record Leave of Absence</DialogTitle></DialogHeader>
                              <form onSubmit={handleAddLeave} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <Input type="date" value={leaveStart} onChange={(e) => setLeaveStart(e.target.value)} required />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>End Date</Label>
                                    <Input type="date" value={leaveEnd} onChange={(e) => setLeaveEnd(e.target.value)} required />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label>Reason</Label>
                                  <Textarea value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} placeholder="Reason for leave" required />
                                </div>
                                <Button type="submit" className="w-full">Record Leave</Button>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Progress value={attendancePercent} className="h-2" />
                        <p className="text-xs text-muted-foreground">Students are present by default. Only mark absences below.</p>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Input type="date" value={absentDate} onChange={(e) => setAbsentDate(e.target.value)} className="w-auto" />
                          <Input value={absentReason} onChange={(e) => setAbsentReason(e.target.value)} placeholder="Reason (optional)" className="flex-1" />
                          <Button onClick={handleMarkAbsent} variant="destructive" size="sm">Mark Absent</Button>
                        </div>
                        {attendanceRecords.length > 0 && (
                          <div className="max-h-48 overflow-y-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Date</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Reason</TableHead>
                                  <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {attendanceRecords.map((r) => (
                                  <TableRow key={r.id}>
                                    <TableCell>{r.date}</TableCell>
                                    <TableCell>
                                      <Badge variant={r.status === "leave" ? "secondary" : "destructive"} className="text-xs">
                                        {r.status === "leave" ? "Leave" : "Absent"}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">{r.reason || "—"}</TableCell>
                                    <TableCell className="text-right">
                                      <Button variant="ghost" size="icon" onClick={() => handleDeleteAttendance(r.id)} className="text-destructive"><Trash2 size={14} /></Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Test Marks */}
                    <Card>
                      <CardHeader><CardTitle>Test Marks</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Test</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead className="text-right">Marks</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                              <TableHead className="text-right">%</TableHead>
                              <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {testMarks.map((t) => (
                              <TableRow key={t.id}>
                                <TableCell className="font-medium">{t.test_name}</TableCell>
                                <TableCell className="text-muted-foreground text-sm">{t.test_date || "—"}</TableCell>
                                <TableCell className="text-right">{t.marks}</TableCell>
                                <TableCell className="text-right">{t.total}</TableCell>
                                <TableCell className="text-right">{((t.marks / t.total) * 100).toFixed(1)}%</TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="icon" onClick={() => handleDeleteTest(t.id)} className="text-destructive"><Trash2 size={14} /></Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        <form onSubmit={handleAddTest} className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border flex-wrap">
                          <Input placeholder="Test name" value={newTest.testName} onChange={(e) => setNewTest({ ...newTest, testName: e.target.value })} required />
                          <Input type="date" value={newTest.testDate} onChange={(e) => setNewTest({ ...newTest, testDate: e.target.value })} className="w-40" />
                          <Input type="number" placeholder="Marks" value={newTest.marks} onChange={(e) => setNewTest({ ...newTest, marks: e.target.value })} className="w-24" required />
                          <Input type="number" placeholder="Total" value={newTest.total} onChange={(e) => setNewTest({ ...newTest, total: e.target.value })} className="w-24" required />
                          <Button type="submit"><UserPlus size={14} /> Add</Button>
                        </form>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="py-16 text-center text-muted-foreground">
                      <Users className="mx-auto mb-3" size={40} />
                      <p>Select a student to view and edit their details</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminStudents;
