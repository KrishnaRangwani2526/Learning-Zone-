import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, FileText, Video, StickyNote, ArrowLeft, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { mockContent } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";

const typeIcons = { pdf: FileText, video: Video, notes: StickyNote };
const typeColors = { pdf: "bg-destructive/10 text-destructive", video: "bg-primary/10 text-primary", notes: "bg-secondary/10 text-secondary" };

const StudentContent = () => {
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("All");

  const subjects = ["All", ...Array.from(new Set(mockContent.map((c) => c.subject)))];

  const filtered = mockContent.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    const matchSubject = filterSubject === "All" || c.subject === filterSubject;
    return matchSearch && matchSubject;
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
              <p className="text-muted-foreground">Browse notes, PDFs, and video lectures</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input placeholder="Search content..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {subjects.map((s) => (
                <Button key={s} variant={filterSubject === s ? "default" : "outline"} size="sm" onClick={() => setFilterSubject(s)}>
                  {s}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item, i) => {
              const Icon = typeIcons[item.type];
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="hover:shadow-md transition-all h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className={`p-2 rounded-lg ${typeColors[item.type]}`}>
                          <Icon size={18} />
                        </div>
                        <Badge variant="outline" className="text-xs">{item.subject}</Badge>
                      </div>
                      <CardTitle className="text-base mt-2">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{item.uploadedAt}</span>
                        <Button size="sm" variant="outline">View</Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="mx-auto mb-3" size={40} />
              <p>No content found matching your search.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default StudentContent;
