import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-display text-foreground">Admin Panel</h1>
              <p className="text-muted-foreground mt-1">Welcome, {user?.name || "Admin"}</p>
            </div>
            <Button variant="outline" onClick={async () => { await logout(); navigate("/"); }}>
              <LogOut size={16} /> Logout
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            <Link to="/admin/content">
              <Card className="group cursor-pointer hover:shadow-lg transition-all hover:border-primary/40 h-full">
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    <BookOpen className="text-primary" size={28} />
                  </div>
                  <CardTitle className="text-xl">Manage Content</CardTitle>
                  <CardDescription>Add, edit, or remove study materials</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link to="/admin/students">
              <Card className="group cursor-pointer hover:shadow-lg transition-all hover:border-primary/40 h-full">
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-3 group-hover:bg-secondary/20 transition-colors">
                    <LayoutDashboard className="text-secondary" size={28} />
                  </div>
                  <CardTitle className="text-xl">Student Dashboard</CardTitle>
                  <CardDescription>Manage attendance and test marks</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
