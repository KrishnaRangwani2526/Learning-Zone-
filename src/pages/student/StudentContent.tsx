import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { BookOpen, FileText, Video, StickyNote, ArrowLeft, Search, Download, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import ContentPreviewModal from "@/components/student/ContentPreviewModal";
import { getFileExtension, getOfficePreviewUrl, getPreviewKind, type PreparedViewingFile } from "@/lib/contentPreview";

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
  const [viewingFile, setViewingFile] = useState<PreparedViewingFile | null>(null);
  const [viewerLoading, setViewerLoading] = useState(false);
  const objectUrlsRef = useRef<string[]>([]);

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
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current = [];
    };
  }, []);

  const releaseObjectUrl = (url: string) => {
    URL.revokeObjectURL(url);
    objectUrlsRef.current = objectUrlsRef.current.filter((trackedUrl) => trackedUrl !== url);
  };

  const releaseViewingFile = (file: PreparedViewingFile | null) => {
    if (file?.isObjectUrl) {
      releaseObjectUrl(file.url);
    }
  };

  const handleViewFile = async (item: ContentRow) => {
    if (!item.file_url) return;
    setViewerLoading(true);

    try {
      const extension = getFileExtension(item.file_url);
      const initialKind = getPreviewKind(extension, "", item.type);

      releaseViewingFile(viewingFile);

      if (initialKind === "office") {
        setViewingFile({
          url: getOfficePreviewUrl(item.file_url, extension),
          title: item.title,
          kind: "office",
          isObjectUrl: false,
          mimeType: "",
          downloadUrl: item.file_url,
          extension,
        });
        return;
      }

      const response = await fetch(item.file_url);
      if (!response.ok) {
        throw new Error("Failed to load file");
      }

      const blob = await response.blob();
      const mimeType = blob.type || response.headers.get("content-type") || "";
      const previewKind = getPreviewKind(extension, mimeType, item.type);

      if (previewKind === "text") {
        const textContent = await blob.text();
        setViewingFile({
          url: "",
          title: item.title,
          kind: "text",
          isObjectUrl: false,
          mimeType,
          downloadUrl: item.file_url,
          extension,
          textContent,
        });
        return;
      }

      if (previewKind === "unsupported") {
        setViewingFile({
          url: "",
          title: item.title,
          kind: "unsupported",
          isObjectUrl: false,
          mimeType,
          downloadUrl: item.file_url,
          extension,
        });
        return;
      }

      const objectUrl = URL.createObjectURL(blob);
      objectUrlsRef.current.push(objectUrl);

      setViewingFile({
        url: objectUrl,
        title: item.title,
        kind: previewKind,
        isObjectUrl: true,
        mimeType,
        downloadUrl: item.file_url,
        extension,
      });
    } catch {
      await handleDownload(item.file_url, item.title);
    } finally {
      setViewerLoading(false);
    }
  };

  const closeViewer = () => {
    releaseViewingFile(viewingFile);
    setViewingFile(null);
  };

  const handleDownload = async (url: string, title: string) => {
    const extension = getFileExtension(url);
    const downloadName = title.includes(".") || !extension ? title : `${title}.${extension}`;

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
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

      <ContentPreviewModal
        viewingFile={viewingFile}
        viewerLoading={viewerLoading}
        onClose={closeViewer}
        onDownload={handleDownload}
      />
    </div>
  );
};

export default StudentContent;