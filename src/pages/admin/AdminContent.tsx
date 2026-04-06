import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, FileText, Video, StickyNote, Trash2, Upload, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const typeIcons: Record<string, typeof FileText> = { pdf: FileText, video: Video, notes: StickyNote };

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

const AdminContent = () => {
  const [content, setContent] = useState<ContentRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", type: "pdf", subject: "", course: "" });
  const [courseFilter, setCourseFilter] = useState("all");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchContent = async () => {
    const { data, error } = await supabase.from("content").select("*").order("created_at", { ascending: false });
    if (data) setContent(data);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    setLoading(false);
  };

  useEffect(() => { fetchContent(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.subject || !form.course) return;

    setUploading(true);
    let fileUrl: string | null = null;

    // Upload file if selected
    if (file) {
      const fileExt = file.name.split(".").pop();
      const filePath = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("content-files")
        .upload(filePath, file);

      if (uploadError) {
        toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage.from("content-files").getPublicUrl(filePath);
      fileUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from("content").insert({
      title: form.title,
      description: form.description || null,
      type: form.type,
      subject: form.subject,
      course: form.course,
      file_url: fileUrl,
      created_by: user?.id || null,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Content added successfully" });
      setForm({ title: "", description: "", type: "pdf", subject: "", course: "" });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setShowForm(false);
      fetchContent();
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    const item = content.find((c) => c.id === id);
    // Delete file from storage if exists
    if (item?.file_url) {
      const path = item.file_url.split("/content-files/")[1];
      if (path) await supabase.storage.from("content-files").remove([path]);
    }
    const { error } = await supabase.from("content").delete().eq("id", id);
    if (!error) {
      fetchContent();
      toast({ title: "Content removed" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Link to="/admin/dashboard">
                <Button variant="ghost" size="icon"><ArrowLeft size={20} /></Button>
              </Link>
              <div>
                <h1 className="text-3xl font-display text-foreground">Manage Content</h1>
                <p className="text-muted-foreground">Add or remove study materials</p>
              </div>
            </div>
            <Button onClick={() => setShowForm(!showForm)}><Plus size={16} /> Add Content</Button>
          </div>

          {/* Course Filter */}
          {(() => {
            const uniqueCourses = Array.from(new Set(content.map((c) => c.course))).sort();
            return uniqueCourses.length > 1 ? (
              <div className="flex gap-2 flex-wrap">
                <Button variant={courseFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setCourseFilter("all")}>All</Button>
                {uniqueCourses.map((c) => (
                  <Button key={c} variant={courseFilter === c ? "default" : "outline"} size="sm" onClick={() => setCourseFilter(c)}>{c}</Button>
                ))}
              </div>
            ) : null;
          })()}

          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
              <Card>
                <CardHeader><CardTitle className="text-lg">Add New Content</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Content title" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g., Physics" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Course</Label>
                      <Input value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} placeholder="e.g., JEE Advanced" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <div className="flex gap-2">
                        {(["pdf", "video", "notes"] as const).map((t) => (
                          <Button key={t} type="button" variant={form.type === t ? "default" : "outline"} size="sm" onClick={() => setForm({ ...form, type: t })}>
                            {t.toUpperCase()}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Description</Label>
                      <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Upload File</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          ref={fileInputRef}
                          type="file"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                          className="flex-1"
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mp3,.jpg,.png,.txt"
                        />
                        {file && (
                          <Badge variant="secondary" className="shrink-0">
                            <Upload size={12} className="mr-1" /> {file.name}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Max 20MB. Supported: PDF, DOC, PPT, MP4, images, etc.</p>
                    </div>
                    <div className="flex items-end gap-2">
                      <Button type="submit" disabled={uploading}>
                        {uploading ? <><Loader2 size={16} className="animate-spin mr-1" /> Uploading...</> : "Save Content"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {loading ? (
            <p className="text-center text-muted-foreground py-12">Loading content...</p>
          ) : (
            <div className="space-y-3">
              {(() => {
                const filtered = courseFilter === "all" ? content : content.filter((c) => c.course === courseFilter);
                return filtered.length === 0 ? <p className="text-center text-muted-foreground py-12">No content found.</p> : null;
              })()}
              {(courseFilter === "all" ? content : content.filter((c) => c.course === courseFilter)).map((item, i) => {
                const Icon = typeIcons[item.type] || FileText;
                return (
                  <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                    <Card className="hover:shadow-sm transition-all">
                      <CardContent className="flex items-center gap-4 py-4">
                        <div className="p-2 rounded-lg bg-primary/10"><Icon className="text-primary" size={20} /></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{item.title}</p>
                          <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                        </div>
                        {item.file_url && <Badge variant="default" className="hidden sm:inline-flex text-xs">File ✓</Badge>}
                        <Badge variant="outline" className="hidden sm:inline-flex">{item.course}</Badge>
                        <Badge variant="secondary" className="hidden md:inline-flex">{item.subject}</Badge>
                        <span className="text-xs text-muted-foreground hidden md:block">{item.created_at?.split("T")[0]}</span>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-destructive hover:text-destructive">
                          <Trash2 size={16} />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminContent;
