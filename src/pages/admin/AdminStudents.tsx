import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, UserPlus, Save, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { mockStudents, Student } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";

const AdminStudents = () => {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editAttendance, setEditAttendance] = useState("");
  const [newTest, setNewTest] = useState({ testName: "", marks: "", total: "" });

  const selected = students.find((s) => s.id === selectedId);

  const handleUpdateAttendance = () => {
    if (!selectedId || !editAttendance) return;
    setStudents(students.map((s) =>
      s.id === selectedId ? { ...s, attendance: Math.min(100, Math.max(0, Number(editAttendance))) } : s
    ));
  };

  const handleAddTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !newTest.testName || !newTest.marks || !newTest.total) return;
    setStudents(students.map((s) =>
      s.id === selectedId
        ? { ...s, testMarks: [...s.testMarks, { testName: newTest.testName, marks: Number(newTest.marks), total: Number(newTest.total) }] }
        : s
    ));
    setNewTest({ testName: "", marks: "", total: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center gap-3">
            <Link to="/admin/dashboard">
              <Button variant="ghost" size="icon"><ArrowLeft size={20} /></Button>
            </Link>
            <div>
              <h1 className="text-3xl font-display text-foreground">Student Dashboard</h1>
              <p className="text-muted-foreground">Manage attendance and test marks</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Student list */}
            <Card className="lg:col-span-1">
              <CardHeader><CardTitle className="flex items-center gap-2"><Users size={18} /> Students</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {students.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedId(s.id); setEditAttendance(String(s.attendance)); }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedId === s.id ? "bg-primary/10 border border-primary/30" : "hover:bg-muted"
                    }`}
                  >
                    <p className="font-medium text-foreground text-sm">{s.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{s.course}</Badge>
                      <span className="text-xs text-muted-foreground">Att: {s.attendance}%</span>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Student detail */}
            <div className="lg:col-span-2 space-y-4">
              {selected ? (
                <>
                  <Card>
                    <CardHeader><CardTitle>{selected.name} — Details</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium text-foreground">{selected.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Course</p>
                          <p className="font-medium text-foreground">{selected.course}</p>
                        </div>
                      </div>

                      {/* Attendance edit */}
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

                  {/* Test marks */}
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
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selected.testMarks.map((t, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium">{t.testName}</TableCell>
                              <TableCell className="text-right">{t.marks}</TableCell>
                              <TableCell className="text-right">{t.total}</TableCell>
                              <TableCell className="text-right">{((t.marks / t.total) * 100).toFixed(1)}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {/* Add test */}
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
        </motion.div>
      </div>
    </div>
  );
};

export default AdminStudents;
