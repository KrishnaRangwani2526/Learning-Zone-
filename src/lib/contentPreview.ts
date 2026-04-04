export type PreviewKind = "pdf" | "video" | "image" | "audio" | "text" | "office" | "unsupported";

export interface PreparedViewingFile {
  url: string;
  title: string;
  kind: PreviewKind;
  isObjectUrl: boolean;
  mimeType: string;
  downloadUrl: string;
  extension: string;
  textContent?: string;
}

const imageExtensions = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "avif"]);
const audioExtensions = new Set(["mp3", "wav", "ogg", "m4a", "aac"]);
const videoExtensions = new Set(["mp4", "webm", "ogg", "mov", "m4v"]);
const textExtensions = new Set(["txt", "md", "csv", "json", "log"]);
const officeExtensions = new Set(["doc", "docx", "ppt", "pptx", "xls", "xlsx"]);

export const getFileExtension = (url: string) => {
  try {
    const pathname = new URL(url).pathname;
    return pathname.split(".").pop()?.toLowerCase() ?? "";
  } catch {
    return url.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
  }
};

export const getPreviewKind = (extension: string, mimeType: string, declaredType: string): PreviewKind => {
  const normalizedExtension = extension.toLowerCase();
  const normalizedMimeType = mimeType.toLowerCase();
  const normalizedDeclaredType = declaredType.toLowerCase();

  if (normalizedMimeType.includes("pdf") || normalizedExtension === "pdf" || normalizedDeclaredType === "pdf") {
    return "pdf";
  }

  if (normalizedMimeType.startsWith("video/") || videoExtensions.has(normalizedExtension) || normalizedDeclaredType === "video") {
    return "video";
  }

  if (normalizedMimeType.startsWith("image/") || imageExtensions.has(normalizedExtension)) {
    return "image";
  }

  if (normalizedMimeType.startsWith("audio/") || audioExtensions.has(normalizedExtension)) {
    return "audio";
  }

  if (
    normalizedMimeType.startsWith("text/") ||
    normalizedMimeType === "application/json" ||
    textExtensions.has(normalizedExtension)
  ) {
    return "text";
  }

  if (officeExtensions.has(normalizedExtension)) {
    return "office";
  }

  return "unsupported";
};

export const getOfficePreviewUrl = (url: string, extension: string) => {
  const encodedUrl = encodeURIComponent(url);

  if (["doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(extension.toLowerCase())) {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
  }

  return `https://docs.google.com/gview?embedded=1&url=${encodedUrl}`;
};