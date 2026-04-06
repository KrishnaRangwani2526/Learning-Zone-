import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Download, IndianRupee, Users, TrendingUp, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import Navbar from "@/components/Navbar";

interface FeeRecord {
  id: string;
  student_id: string;
  amount: number;
  month: string;
  year: number;
  paid_at: string;
  notes: string | null;
  students?: { name: string; course: string; email: string; parent_contact: string | null };
}

interface Student {
  id: string;
  name: string;
  course: string;
  email: string;
  parent_contact: string | null;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(210, 70%, 50%)", "hsl(150, 60%, 45%)", "hsl(30, 80%, 55%)", "hsl(0, 70%, 55%)"];

const AdminFees = () => {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [newFee, setNewFee] = useState({ studentId: "", amount: "", month: "", year: String(new Date().getFullYear()), notes: "" });
  const [feeCourseFilter, setFeeCourseFilter] = useState("all");
  const [feeMonthFilter, setFeeMonthFilter] = useState("all");
  // Fee form: course → student flow
  const [formCourseFilter, setFormCourseFilter] = useState("all");
  const { toast } = useToast();

  const courses = Array.from(new Set(students.map((s) => s.course))).sort();
  const formFilteredStudents = formCourseFilter === "all" ? students : students.filter((s) => s.course === formCourseFilter);

  const fetchData = async () => {
    const [feesRes, studentsRes] = await Promise.all([
      supabase.from("fees").select("*, students(name, course, email, parent_contact)").order("paid_at", { ascending: false }),
      supabase.from("students").select("id, name, course, email, parent_contact").order("name"),
    ]);
    if (feesRes.data) setFees(feesRes.data as any);
    if (studentsRes.data) setStudents(studentsRes.data as any);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFee.studentId || !newFee.amount || !newFee.month) return;
    const { error } = await supabase.from("fees").insert({
      student_id: newFee.studentId,
      amount: Number(newFee.amount),
      month: newFee.month,
      year: Number(newFee.year),
      notes: newFee.notes || null,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      // Find student to send WhatsApp
      const student = students.find((s) => s.id === newFee.studentId);
      const parentContact = student?.parent_contact;
      toast({ title: "Fee record added!" });
      setNewFee({ studentId: "", amount: "", month: "", year: String(new Date().getFullYear()), notes: "" });
      setFormCourseFilter("all");
      setShowDialog(false);
      fetchData();

      // Open WhatsApp link if parent contact exists
      if (parentContact) {
        const msg = encodeURIComponent(
          `Dear Parent, fee of ₹${newFee.amount} has been received for ${student?.name} for ${newFee.month} ${newFee.year}. Thank you!`
        );
        const phone = parentContact.replace(/\D/g, "");
        window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
      }
    }
  };

  // Filter fees for table
  const filteredFees = fees.filter((f) => {
    const matchCourse = feeCourseFilter === "all" || f.students?.course === feeCourseFilter;
    const matchMonth = feeMonthFilter === "all" || f.month === feeMonthFilter;
    return matchCourse && matchMonth;
  });

  const totalFees = filteredFees.reduce((s, f) => s + f.amount, 0);
  const totalStudentsWithFees = new Set(filteredFees.map((f) => f.student_id)).size;

  const monthlyData = MONTHS.map((m) => ({
    month: m.slice(0, 3),
    amount: fees.filter((f) => f.month === m).reduce((s, f) => s + f.amount, 0),
  }));

  const courseMap: Record<string, number> = {};
  fees.forEach((f) => {
    const course = f.students?.course || "Unknown";
    courseMap[course] = (courseMap[course] || 0) + f.amount;
  });
  const courseData = Object.entries(courseMap).map(([name, value]) => ({ name, value }));

  const downloadCSV = () => {
    const headers = ["Student Name", "Email", "Course", "Month", "Year", "Amount", "Paid At", "Notes"];
    const rows = filteredFees.map((f) => [
      f.students?.name || "", f.students?.email || "", f.students?.course || "",
      f.month, f.year, f.amount, new Date(f.paid_at).toLocaleDateString(), f.notes || "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fees_data_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Link to="/admin/dashboard"><Button variant="ghost" size="icon"><ArrowLeft size={20} /></Button></Link>
              <div>
                <h1 className="text-3xl font-display text-foreground">Fees Management</h1>
                <p className="text-muted-foreground">Track monthly fee submissions and analytics</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={downloadCSV}><Download size={16} /> Export CSV</Button>
              <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogTrigger asChild><Button><Plus size={16} /> Add Fee</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Record Fee Payment</DialogTitle></DialogHeader>
                  <form onSubmit={handleAddFee} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Filter by Course</Label>
                      <Select value={formCourseFilter} onValueChange={(v) => { setFormCourseFilter(v); setNewFee({ ...newFee, studentId: "" }); }}>
                        <SelectTrigger><SelectValue placeholder="All Courses" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Courses</SelectItem>
                          {courses.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Student</Label>
                      <Select value={newFee.studentId} onValueChange={(v) => setNewFee({ ...newFee, studentId: v })}>
                        <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                        <SelectContent>
                          {formFilteredStudents.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} — {s.course}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Month</Label>
                        <Select value={newFee.month} onValueChange={(v) => setNewFee({ ...newFee, month: v })}>
                          <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
                          <SelectContent>{MONTHS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Year</Label>
                        <Input type="number" value={newFee.year} onChange={(e) => setNewFee({ ...newFee, year: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Amount (₹)</Label>
                      <Input type="number" value={newFee.amount} onChange={(e) => setNewFee({ ...newFee, amount: e.target.value })} placeholder="e.g. 5000" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Notes (optional)</Label>
                      <Input value={newFee.notes} onChange={(e) => setNewFee({ ...newFee, notes: e.target.value })} placeholder="Any remarks" />
                    </div>
                    <Button type="submit" className="w-full">
                      <MessageCircle size={16} className="mr-1" /> Record & Notify via WhatsApp
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <Select value={feeCourseFilter} onValueChange={setFeeCourseFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Filter by course" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={feeMonthFilter} onValueChange={setFeeMonthFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Filter by month" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {MONTHS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10"><IndianRupee className="text-primary" size={22} /></div>
                  <div><p className="text-sm text-muted-foreground">Total Collected</p><p className="text-2xl font-bold text-foreground">₹{totalFees.toLocaleString()}</p></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-secondary/10"><Users className="text-secondary" size={22} /></div>
                  <div><p className="text-sm text-muted-foreground">Total Students</p><p className="text-2xl font-bold text-foreground">{students.length}</p></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10"><TrendingUp className="text-primary" size={22} /></div>
                  <div><p className="text-sm text-muted-foreground">Students Paid</p><p className="text-2xl font-bold text-foreground">{totalStudentsWithFees}</p></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Monthly Fee Collection</CardTitle></CardHeader>
              <CardContent>
                <ChartContainer config={{ amount: { label: "Amount", color: "hsl(var(--primary))" } }} className="h-[300px]">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-muted-foreground" />
                    <YAxis className="text-muted-foreground" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Course-wise Collection</CardTitle></CardHeader>
              <CardContent>
                <ChartContainer config={Object.fromEntries(courseData.map((c, i) => [c.name, { label: c.name, color: CHART_COLORS[i % CHART_COLORS.length] }]))} className="h-[300px]">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie data={courseData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {courseData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Fee Records Table */}
          <Card>
            <CardHeader><CardTitle>Fee Records</CardTitle></CardHeader>
            <CardContent>
              {loading ? <p className="text-center text-muted-foreground py-6">Loading...</p> : filteredFees.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">No fee records found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Month</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Paid On</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFees.map((f) => (
                        <TableRow key={f.id}>
                          <TableCell className="font-medium">{f.students?.name || "—"}</TableCell>
                          <TableCell>{f.students?.course || "—"}</TableCell>
                          <TableCell>{f.month} {f.year}</TableCell>
                          <TableCell className="text-right font-medium">₹{f.amount.toLocaleString()}</TableCell>
                          <TableCell>{new Date(f.paid_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-muted-foreground">{f.notes || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminFees;
