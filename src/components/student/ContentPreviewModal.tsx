import { Download, ExternalLink, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PreparedViewingFile } from "@/lib/contentPreview";

interface ContentPreviewModalProps {
  viewingFile: PreparedViewingFile | null;
  viewerLoading: boolean;
  onClose: () => void;
  onDownload: (url: string, title: string) => void;
}

const UnsupportedPreview = ({ onDownload, viewingFile }: Pick<ContentPreviewModalProps, "onDownload"> & { viewingFile: PreparedViewingFile }) => (
  <div className="flex h-full flex-col items-center justify-center gap-4 rounded-lg border border-border bg-muted/20 px-6 text-center">
    <FileText size={48} className="text-muted-foreground" />
    <div className="space-y-1">
      <p className="text-foreground">This file can’t be previewed directly here.</p>
      <p className="text-sm text-muted-foreground">You can still open it in an online viewer or download it.</p>
    </div>
    <div className="flex flex-wrap justify-center gap-2">
      <Button variant="outline" asChild>
        <a href={viewingFile.downloadUrl} target="_blank" rel="noreferrer">
          <ExternalLink size={16} className="mr-2" /> Open File
        </a>
      </Button>
      <Button onClick={() => onDownload(viewingFile.downloadUrl, viewingFile.title)}>
        <Download size={16} className="mr-2" /> Download File
      </Button>
    </div>
  </div>
);

const ContentPreviewModal = ({ viewingFile, viewerLoading, onClose, onDownload }: ContentPreviewModalProps) => {
  if (viewerLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="space-y-2 text-center">
          <p className="font-display text-lg text-foreground">Opening file...</p>
          <p className="text-sm text-muted-foreground">Preparing the best available preview for this file.</p>
        </div>
      </div>
    );
  }

  if (!viewingFile) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/80 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4 border-b border-border bg-background p-4">
        <h3 className="truncate font-display text-lg text-foreground">{viewingFile.title}</h3>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="outline" onClick={() => onDownload(viewingFile.downloadUrl, viewingFile.title)}>
            <Download size={14} className="mr-1" /> Download
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-4">
        {viewingFile.kind === "video" ? (
          <video src={viewingFile.url} controls className="h-full max-h-[calc(100vh-120px)] w-full rounded-lg border border-border bg-background" />
        ) : viewingFile.kind === "audio" ? (
          <div className="flex h-full items-center justify-center rounded-lg border border-border bg-muted/20 p-6">
            <audio src={viewingFile.url} controls className="w-full max-w-2xl" />
          </div>
        ) : viewingFile.kind === "image" ? (
          <div className="flex h-full items-center justify-center overflow-auto rounded-lg border border-border bg-muted/20 p-4">
            <img src={viewingFile.url} alt={viewingFile.title} className="max-h-full max-w-full rounded-lg object-contain" />
          </div>
        ) : viewingFile.kind === "text" ? (
          <div className="h-full overflow-auto rounded-lg border border-border bg-muted/20 p-4">
            <pre className="whitespace-pre-wrap break-words font-mono text-sm text-foreground">{viewingFile.textContent}</pre>
          </div>
        ) : viewingFile.kind === "office" ? (
          <iframe
            src={viewingFile.url}
            title={viewingFile.title}
            className="h-full w-full rounded-lg border border-border bg-background"
          />
        ) : viewingFile.kind === "pdf" ? (
          <object
            data={viewingFile.url}
            type={viewingFile.mimeType || "application/pdf"}
            className="h-full w-full rounded-lg border border-border bg-background"
          >
            <UnsupportedPreview viewingFile={viewingFile} onDownload={onDownload} />
          </object>
        ) : (
          <UnsupportedPreview viewingFile={viewingFile} onDownload={onDownload} />
        )}
      </div>
    </div>
  );
};

export default ContentPreviewModal;