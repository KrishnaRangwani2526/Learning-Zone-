import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, Home, MessageCircle, LogIn, LayoutDashboard, BookOpen, Users, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getNavLinks = () => {
    const contactLink = { label: "Contact", to: "https://wa.me/919928452506?text=Hello,%20I%20have%20a%20query%20about%20the%20courses", external: true };
    if (!isAuthenticated) {
      return [
        { label: "Home", to: "/" },
        contactLink,
        { label: "Login", to: "/login" },
      ];
    }
    if (user?.role === "admin") {
      return [
        { label: "Home", to: "/" },
        contactLink,
        { label: "Dashboard", to: "/admin/dashboard" },
        { label: "Content", to: "/admin/content" },
        { label: "Students", to: "/admin/students" },
      ];
    }
    return [
      { label: "Home", to: "/" },
      contactLink,
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-md shadow-primary/10">
      <div className="container mx-auto flex items-center justify-between h-20 px-4 md:px-8">
        <Link
          to="/"
          className="group flex items-center gap-2 md:gap-3 py-1 px-2 md:px-3 rounded-xl transition-all duration-500 hover:scale-105 hover:-translate-y-1 shadow-md shadow-primary/10 hover:shadow-xl hover:shadow-primary/30 bg-background/60 backdrop-blur-sm border border-primary/10 cursor-pointer"
        >
          <img 
            src="/logo.png" 
            alt="Learning Zone Logo" 
            className="w-12 h-12 md:w-16 md:h-16 object-contain transition-transform duration-500 group-hover:rotate-[2deg] drop-shadow-[0_0_8px_hsl(var(--primary)/0.3)] group-hover:drop-shadow-[0_0_15px_hsl(var(--primary)/0.6)]" 
          />
          <span className="font-display text-xl md:text-3xl text-[#0F2C59] tracking-tight transition-all duration-500 group-hover:text-primary" style={{ fontFamily: "'Trajan Pro', serif", fontWeight: "bold" }}>
            Learning Zone
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            'external' in link && link.external ? (
              <a
                key={link.label}
                href={link.to}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                {link.label}
              </a>
            ) : (
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
            )
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
            <ul className="flex flex-col px-4 pt-4 pb-4 gap-1">
              {navLinks.map((link) => (
                <li key={link.label}>
                  {'external' in link && link.external ? (
                    <a
                      href={link.to}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setOpen(false)}
                      className="block px-4 py-3 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      {link.label}
                    </a>
                  ) : (
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
                  )}
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
