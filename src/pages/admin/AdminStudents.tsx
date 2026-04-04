import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, UserPlus, Save, Users, Trash2, Plus, Eye, EyeOff } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

interface Student {
  id: string;
  name: string;
  email: string;
  course: string;
  attendance: number;
  user_id: string | null;
}

interface TestMark {
  id: string;
  test_name: string;
  marks: number;
  total: number;
}

const AdminStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editAttendance, setEditAttendance] = useState("");
  const [testMarks, setTestMarks] = useState<TestMark[]>([]);
  const [newTest, setNewTest] = useState({ testName: "", marks: "", total: "" });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: "", email: "", password: "", course: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addingStudent, setAddingStudent] = useState(false);
  const [courseFilter, setCourseFilter] = useState("all");
  const { toast } = useToast();

  const courses = Array.from(new Set(students.map((s) => s.course))).sort();
  const filteredStudents = courseFilter === "all" ? students : students.filter((s) => s.course === courseFilter);
  const selected = students.find((s) => s.id === selectedId);

  const fetchStudents = async () => {
    const { data, error } = await supabase.from("students").select("*").order("created_at", { ascending: false });
    if (data) setStudents(data);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    setLoading(false);
  };

  const fetchTestMarks = async (studentId: string) => {
    const { data } = await supabase.from("test_marks").select("*").eq("student_id", studentId).order("created_at");
    if (data) setTestMarks(data);
  };

  useEffect(() => { fetchStudents(); }, []);

  useEffect(() => {
    if (selectedId) {
      const s = students.find((s) => s.id === selectedId);
      if (s) setEditAttendance(String(s.attendance));
      fetchTestMarks(selectedId);
    }
  }, [selectedId]);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.email || !newStudent.password || !newStudent.course) return;
    if (newStudent.password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setAddingStudent(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("create-student-account", {
        body: {
          email: newStudent.email,
          password: newStudent.password,
          name: newStudent.name,
          course: newStudent.course,
        },
      });
      if (res.error || res.data?.error) {
        toast({ title: "Error", description: res.data?.error || res.error?.message, variant: "destructive" });
      } else {
        toast({ title: "Student account created!", description: `Email: ${newStudent.email}` });
        setNewStudent({ name: "", email: "", password: "", course: "" });
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

  const handleUpdateAttendance = async () => {
    if (!selectedId || !editAttendance) return;
    const val = Math.min(100, Math.max(0, Number(editAttendance)));
    const { error } = await supabase.from("students").update({ attendance: val }).eq("id", selectedId);
    if (!error) {
      setStudents(students.map((s) => s.id === selectedId ? { ...s, attendance: val } : s));
      toast({ title: "Attendance updated" });
    }
  };

  const handleAddTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !newTest.testName || !newTest.marks || !newTest.total) return;
    const { error } = await supabase.from("test_marks").insert({
      student_id: selectedId,
      test_name: newTest.testName,
      marks: Number(newTest.marks),
      total: Number(newTest.total),
    });
    if (!error) {
      setNewTest({ testName: "", marks: "", total: "" });
      fetchTestMarks(selectedId);
      toast({ title: "Test mark added" });
    }
  };

  const handleDeleteTest = async (id: string) => {
    await supabase.from("test_marks").delete().eq("id", id);
    if (selectedId) fetchTestMarks(selectedId);
  };

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
                <p className="text-muted-foreground">Add students with login credentials, manage attendance and marks</p>
              </div>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button><Plus size={16} /> Add Student</Button>
              </DialogTrigger>
              <DialogContent>
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
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={newStudent.password}
                        onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                        placeholder="Min 6 characters"
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Course</Label>
                    <Input value={newStudent.course} onChange={(e) => setNewStudent({ ...newStudent, course: e.target.value })} placeholder="e.g., JEE Advanced" required />
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
                <CardHeader><CardTitle className="flex items-center gap-2"><Users size={18} /> Students ({students.length})</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {students.length === 0 && <p className="text-sm text-muted-foreground">No students yet. Add one!</p>}
                  {students.map((s) => (
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
                          <span className="text-xs text-muted-foreground">Att: {s.attendance}%</span>
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
                    <Card>
                      <CardHeader><CardTitle>{selected.name} — Details</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium text-foreground">{selected.email}</p></div>
                          <div><p className="text-sm text-muted-foreground">Course</p><p className="font-medium text-foreground">{selected.course}</p></div>
                        </div>
                        <div className="flex items-end gap-3">
                          <div className="space-y-1 flex-1">
                            <Label>Attendance (%)</Label>
                            <Input type="number" min={0} max={100} value={editAttendance} onChange={(e) => setEditAttendance(e.target.value)} />
                          </div>
                          <Button onClick={handleUpdateAttendance}><Save size={14} /> Update</Button>
                        </div>
                        <Progress value={selected.attendance} className="h-2" />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader><CardTitle>Test Marks</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Test</TableHead>
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
                        <form onSubmit={handleAddTest} className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border">
                          <Input placeholder="Test name" value={newTest.testName} onChange={(e) => setNewTest({ ...newTest, testName: e.target.value })} required />
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
