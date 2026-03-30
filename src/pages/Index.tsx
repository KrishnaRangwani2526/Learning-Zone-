import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import CoursesSection from "@/components/CoursesSection";
import AchievementsSection from "@/components/AchievementsSection";
import FacultySection from "@/components/FacultySection";
import GallerySection from "@/components/GallerySection";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen">
    <Navbar />
    <main className="pt-16">
      <HeroSection />
      <AboutSection />
      <CoursesSection />
      <AchievementsSection />
      <FacultySection />
      <GallerySection />
    </main>
    <Footer />
  </div>
);

export default Index;
