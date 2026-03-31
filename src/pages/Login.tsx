import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, ShieldCheck, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

const Login = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email || !password || (mode === "signup" && !name)) {
      setError("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    if (mode === "signup") {
      const { error } = await signup(email, password, name);
      if (error) setError(error);
      else setSuccess("Account created! Check your email to confirm, then log in.");
    } else {
      const { error } = await login(email, password);
      if (error) setError(error);
      // Auth state change will redirect via useEffect in a wrapper or user navigates
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Card className="border-border shadow-lg">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-2xl font-display">
                {mode === "login" ? "Welcome Back" : "Create Account"}
              </CardTitle>
              <CardDescription>
                {mode === "login" ? "Sign in to your account" : "Sign up as a student"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Mode Toggle */}
              <div className="flex gap-3 mb-6">
                {([
                  { value: "login" as const, label: "Login", icon: LogIn },
                  { value: "signup" as const, label: "Sign Up", icon: UserPlus },
                ]).map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => { setMode(value); setError(""); setSuccess(""); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all font-medium text-sm ${
                      mode === value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    <Icon size={18} />
                    {label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                {success && <p className="text-sm text-green-600">{success}</p>}
                <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                  {submitting ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
