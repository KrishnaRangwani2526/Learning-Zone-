import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getNavLinks = () => {
    if (!isAuthenticated) {
      return [
        { label: "Home", to: "/" },
        { label: "Login", to: "/login" },
      ];
    }
    if (user?.role === "admin") {
      return [
        { label: "Home", to: "/" },
        { label: "Dashboard", to: "/admin/dashboard" },
        { label: "Content", to: "/admin/content" },
        { label: "Students", to: "/admin/students" },
      ];
    }
    return [
      { label: "Home", to: "/" },
      { label: "Dashboard", to: "/student/dashboard" },
      { label: "Content", to: "/student/content" },
      { label: "My Progress", to: "/student/my-dashboard" },
    ];
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navLinks = getNavLinks();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4 md:px-8">
        <Link to="/" className="font-display text-xl md:text-2xl text-foreground tracking-tight">
          Coaching Institute
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <Button variant="ghost" size="sm" onClick={handleLogout} className="ml-2 text-muted-foreground">
              <LogOut size={16} /> Logout
            </Button>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden bg-background border-b border-border"
          >
            <ul className="flex flex-col px-4 pb-4 gap-1">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === link.to
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {isAuthenticated && (
                <li>
                  <button
                    onClick={() => { setOpen(false); handleLogout(); }}
                    className="block w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-muted transition-colors"
                  >
                    Logout
                  </button>
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
