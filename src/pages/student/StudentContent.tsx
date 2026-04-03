import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, FileText, Video, StickyNote, ArrowLeft, Search, Download, Eye, X } from "lucide-react";
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

interface ViewingFile {
  url: string;
  title: string;
  type: string;
  isObjectUrl: boolean;
}

const StudentContent = () => {
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("All");
  const [content, setContent] = useState<ContentRow[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingFile, setViewingFile] = useState<ViewingFile | null>(null);
  const [viewerLoading, setViewerLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const contentRes = await supabase.from("content").select("*").order("created_at", { ascending: false });
      if (contentRes.data) {
        setContent(contentRes.data);
        const uniqueCourses = [...new Set(contentRes.data.map((c) => c.course))];
        setCourses(uniqueCourses);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    return () => {
      if (viewingFile?.isObjectUrl) {
        URL.revokeObjectURL(viewingFile.url);
      }
    };
  }, [viewingFile]);

  const handleViewFile = async (item: ContentRow) => {
    if (!item.file_url) return;
    setViewerLoading(true);

    try {
      const response = await fetch(item.file_url);
      if (!response.ok) {
        throw new Error("Failed to load file");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      setViewingFile({
        url: objectUrl,
        title: item.title,
        type: item.type,
        isObjectUrl: true,
      });
    } catch {
      await handleDownload(item.file_url, item.title);
    } finally {
      setViewerLoading(false);
    }
  };

  const handleDownload = async (url: string, title: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, "_blank");
    }
  };

  const filtered = content.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || (c.description || "").toLowerCase().includes(search.toLowerCase());
    const matchCourse = filterCourse === "All" || c.course === filterCourse;
    return matchSearch && matchCourse;
  });

  const renderContentCard = (item: ContentRow, i: number) => {
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
              {item.file_url && (
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => void handleViewFile(item)}>
                    <Eye size={14} className="mr-1" /> View
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDownload(item.file_url!, item.title)}>
                    <Download size={14} />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

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
              {filterCourse === "All" ? (
                courses.map((course) => {
                  const courseContent = filtered.filter((c) => c.course === course);
                  if (courseContent.length === 0) return null;
                  return (
                    <div key={course} className="space-y-3">
                      <h2 className="text-xl font-display text-foreground border-b border-border pb-2">{course}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {courseContent.map((item, i) => renderContentCard(item, i))}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((item, i) => renderContentCard(item, i))}
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

      {/* File Viewer Modal */}
      {viewerLoading && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="font-display text-lg text-foreground">Opening file...</p>
            <p className="text-sm text-muted-foreground">Preparing a safe preview inside the app.</p>
          </div>
        </div>
      )}

      {viewingFile && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border bg-background">
            <h3 className="font-display text-lg text-foreground truncate">{viewingFile.title}</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleDownload(viewingFile.url, viewingFile.title)}>
                <Download size={14} className="mr-1" /> Download
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setViewingFile(null)}>
                <X size={18} />
              </Button>
            </div>
          </div>
          <div className="flex-1 p-4">
            {viewingFile.type === "video" ? (
              <video src={viewingFile.url} controls className="w-full h-full max-h-[calc(100vh-120px)] rounded-lg" />
            ) : (
              <iframe src={viewingFile.url} className="w-full h-full rounded-lg border border-border" title={viewingFile.title} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentContent;