"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Sparkles, Trash2, WandSparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import type { ImageFile } from "@/types";

interface ImageUploaderProps {
  onImageSelect: (file: ImageFile | null) => void;
  onEnhance?: () => void | Promise<void>;
  enhancing?: boolean;
  disabled?: boolean;
}

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export function ImageUploader({
  onImageSelect,
  onEnhance,
  enhancing = false,
  disabled = false,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const readFile = useCallback(
    (file: File) => {
      setError(null);
      if (!file.type.startsWith("image/")) {
        setError("That file is not an image.");
        return;
      }
      if (!ALLOWED.includes(file.type)) {
        setError("Please use JPG, PNG or WebP.");
        return;
      }
      if (file.size > MAX_SIZE) {
        setError("Image must be smaller than 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPreview(dataUrl);
        setFileName(file.name);
        setFileSize(file.size);
        onImageSelect({
          base64: dataUrl.split(",")[1],
          mimeType: file.type,
          name: file.name,
        });
      };
      reader.onerror = () => setError("Could not read that file.");
      reader.readAsDataURL(file);
    },
    [onImageSelect]
  );

  // Paste an image straight from the clipboard
  useEffect(() => {
    const handler = (event: ClipboardEvent) => {
      const item = Array.from(event.clipboardData?.items ?? []).find((i) =>
        i.type.startsWith("image/")
      );
      const file = item?.getAsFile();
      if (file) readFile(file);
    };
    window.addEventListener("paste", handler);
    return () => window.removeEventListener("paste", handler);
  }, [readFile]);

  const clear = () => {
    setPreview(null);
    setFileName("");
    setFileSize(0);
    onImageSelect(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  if (preview) {
    return (
      <div className="space-y-3">
        <div className="group relative overflow-hidden rounded-xl border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Uploaded room" className="h-56 w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-white">{fileName}</p>
              <p className="text-[11px] text-white/70">{(fileSize / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <Badge variant="secondary" className="bg-white/15 text-white">
              <Sparkles className="h-3 w-3" /> Reference ready
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={disabled}>
            <ImagePlus className="h-4 w-4" /> Replace
          </Button>
          {onEnhance && (
            <Button variant="outline" size="sm" onClick={onEnhance} disabled={disabled || enhancing}>
              {enhancing ? <Loader2 className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
              Auto-style with AI
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={clear} className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" /> Remove
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) readFile(file);
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) readFile(file);
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all",
          "hover:border-primary/70 hover:bg-primary/5",
          dragging && "border-primary bg-primary/10 scale-[1.01]",
          disabled && "cursor-not-allowed opacity-60"
        )}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ImagePlus className="h-6 w-6" />
        </span>
        <span className="space-y-1">
          <span className="block text-sm font-semibold">Drop a photo of your empty room</span>
          <span className="block text-xs text-muted-foreground">
            or click to browse · paste from clipboard · JPG, PNG, WebP up to 5MB
          </span>
        </span>
      </button>
      {error && <p className="mt-2 text-xs font-medium text-destructive">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) readFile(file);
        }}
      />
    </div>
  );
}
