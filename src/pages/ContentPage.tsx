import { useAuth } from "@/contexts/AuthContext";
import StudentContent from "./student/StudentContent";
import AdminContent from "./admin/AdminContent";
import { Navigate } from "react-router-dom";

const ContentPage = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  return user?.role === "admin" ? <AdminContent /> : <StudentContent />;
};

export default ContentPage;
