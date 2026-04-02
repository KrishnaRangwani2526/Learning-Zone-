import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, FileText, Video, StickyNote, ArrowLeft, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";

const typeIcons: Record<string, typeof FileText> = { pdf: FileText, video: Video, notes: StickyNote };
const typeColors: Record<string, string> = { pdf: "bg-destructive/10 text-destructive", video: "bg-primary/10 text-primary", notes: "bg-secondary/10 text-secondary" };

interface ContentRow {
  id: string;
  title: string;
  description: string | null;
  type: string;
  subject: string;
  course: string;
  file_url: string | null;
  created_at: string;
}

const StudentContent = () => {
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("All");
  const [content, setContent] = useState<ContentRow[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const contentRes = await supabase.from("content").select("*").order("created_at", { ascending: false });
      if (contentRes.data) {
        setContent(contentRes.data);
        // Derive courses from actual content data
        const uniqueCourses = [...new Set(contentRes.data.map((c) => c.course))];
        setCourses(uniqueCourses);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = content.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || (c.description || "").toLowerCase().includes(search.toLowerCase());
    const matchCourse = filterCourse === "All" || c.course === filterCourse;
    return matchSearch && matchCourse;
  });

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
              <h1 className="text-3xl font-display text-foreground">Study Content</h1>
              <p className="text-muted-foreground">Browse notes, PDFs, and video lectures by course</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input placeholder="Search content..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["All", ...courses].map((c) => (
                <Button key={c} variant={filterCourse === c ? "default" : "outline"} size="sm" onClick={() => setFilterCourse(c)}>
                  {c}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground py-12">Loading content...</p>
          ) : (
            <>
              {/* Group by course */}
              {filterCourse === "All" ? (
                courses.map((course) => {
                  const courseContent = filtered.filter((c) => c.course === course);
                  if (courseContent.length === 0) return null;
                  return (
                    <div key={course} className="space-y-3">
                      <h2 className="text-xl font-display text-foreground border-b border-border pb-2">{course}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {courseContent.map((item, i) => {
                          const Icon = typeIcons[item.type] || FileText;
                          return (
                            <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                              <Card className="hover:shadow-md transition-all h-full">
                                <CardHeader className="pb-3">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className={`p-2 rounded-lg ${typeColors[item.type] || "bg-muted"}`}><Icon size={18} /></div>
                                    <Badge variant="outline" className="text-xs">{item.subject}</Badge>
                                  </div>
                                  <CardTitle className="text-base mt-2">{item.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">{item.created_at?.split("T")[0]}</span>
                                    {item.file_url && <Button size="sm" variant="outline" asChild><a href={item.file_url} target="_blank" rel="noopener noreferrer">View</a></Button>}
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((item, i) => {
                    const Icon = typeIcons[item.type] || FileText;
                    return (
                      <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <Card className="hover:shadow-md transition-all h-full">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className={`p-2 rounded-lg ${typeColors[item.type] || "bg-muted"}`}><Icon size={18} /></div>
                              <Badge variant="outline" className="text-xs">{item.subject}</Badge>
                            </div>
                            <CardTitle className="text-base mt-2">{item.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">{item.created_at?.split("T")[0]}</span>
                              {item.file_url && <Button size="sm" variant="outline" asChild><a href={item.file_url} target="_blank" rel="noopener noreferrer">View</a></Button>}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {filtered.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="mx-auto mb-3" size={40} />
                  <p>No content found matching your search.</p>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default StudentContent;
