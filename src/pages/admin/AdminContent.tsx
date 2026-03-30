import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, FileText, Video, StickyNote, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { mockContent, ContentItem } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";

const typeIcons = { pdf: FileText, video: Video, notes: StickyNote };

const AdminContent = () => {
  const [content, setContent] = useState<ContentItem[]>(mockContent);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", type: "pdf" as ContentItem["type"], subject: "" });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.subject) return;
    const newItem: ContentItem = {
      id: Date.now().toString(),
      title: form.title,
      description: form.description,
      type: form.type,
      subject: form.subject,
      uploadedAt: new Date().toISOString().split("T")[0],
    };
    setContent([newItem, ...content]);
    setForm({ title: "", description: "", type: "pdf", subject: "" });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setContent(content.filter((c) => c.id !== id));
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
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus size={16} /> Add Content
            </Button>
          </div>

          {/* Add Form */}
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
                    <div className="space-y-2 md:col-span-2">
                      <Label>Description</Label>
                      <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description" />
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
                    <div className="flex items-end gap-2">
                      <Button type="submit">Save Content</Button>
                      <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Content list */}
          <div className="space-y-3">
            {content.map((item, i) => {
              const Icon = typeIcons[item.type];
              return (
                <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card className="hover:shadow-sm transition-all">
                    <CardContent className="flex items-center gap-4 py-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="text-primary" size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{item.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                      </div>
                      <Badge variant="outline" className="hidden sm:inline-flex">{item.subject}</Badge>
                      <span className="text-xs text-muted-foreground hidden md:block">{item.uploadedAt}</span>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-destructive hover:text-destructive">
                        <Trash2 size={16} />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminContent;
