import { motion } from "framer-motion";
import { ArrowLeft, CalendarCheck, Trophy, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { mockStudents } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Navbar from "@/components/Navbar";

const StudentMyDashboard = () => {
  const { user } = useAuth();
  // Use first mock student as the logged-in student's data
  const student = mockStudents[0];

  const avgMarks = student.testMarks.reduce((sum, t) => sum + (t.marks / t.total) * 100, 0) / student.testMarks.length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center gap-3">
            <Link to="/student/dashboard">
              <Button variant="ghost" size="icon"><ArrowLeft size={20} /></Button>
            </Link>
            <div>
              <h1 className="text-3xl font-display text-foreground">My Dashboard</h1>
              <p className="text-muted-foreground">Your performance overview</p>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10"><CalendarCheck className="text-primary" size={22} /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Attendance</p>
                    <p className="text-2xl font-bold text-foreground">{student.attendance}%</p>
                  </div>
                </div>
                <Progress value={student.attendance} className="mt-3" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-secondary/10"><Trophy className="text-secondary" size={22} /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Score</p>
                    <p className="text-2xl font-bold text-foreground">{avgMarks.toFixed(1)}%</p>
                  </div>
                </div>
                <Progress value={avgMarks} className="mt-3" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10"><TrendingUp className="text-primary" size={22} /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Course</p>
                    <p className="text-2xl font-bold text-foreground">{student.course}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Test Marks Table */}
          <Card>
            <CardHeader>
              <CardTitle>Test Marks</CardTitle>
            </CardHeader>
            <CardContent>
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
                  {student.testMarks.map((t, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{t.testName}</TableCell>
                      <TableCell className="text-right">{t.marks}</TableCell>
                      <TableCell className="text-right">{t.total}</TableCell>
                      <TableCell className="text-right">{((t.marks / t.total) * 100).toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentMyDashboard;
