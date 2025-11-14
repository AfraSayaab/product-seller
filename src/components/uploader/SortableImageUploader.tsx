// ===============================
// components/uploader/SortableImageUploader.tsx
// Sortable image uploader with drag-and-drop reordering
// ===============================
"use client";
import * as React from "react";
import axios from "axios";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { Upload, Trash2, GripVertical, Image as ImageIcon } from "lucide-react";
import type { UploadItem } from "@/components/admin/types/uploader";

// Small helper to format sizes
function prettyBytes(bytes: number) {
    const units = ["B", "KB", "MB", "GB"]; 
    let i = 0; 
    let n = bytes;
    while (n >= 1024 && i < units.length - 1) { 
        n /= 1024; 
        i++; 
    }
    return `${n.toFixed(1)} ${units[i]}`;
}

type SortableImageUploaderProps = {
    accept?: string[];
    maxFiles?: number;
    maxSizeMB?: number;
    folder?: string;
    disabled?: boolean;
    defaultValue?: UploadItem[];
    label?: string;
    helperText?: string;
    className?: string;
    onChange?: (items: UploadItem[]) => void;
};

export default function SortableImageUploader({
    accept = ["image/*"],
    maxFiles = 10,
    maxSizeMB = 10,
    folder = "listings",
    disabled = false,
    defaultValue = [],
    label = "Upload images",
    helperText,
    className,
    onChange,
}: SortableImageUploaderProps) {
    const [items, setItems] = React.useState<UploadItem[]>(defaultValue || []);
    const [uploading, setUploading] = React.useState(false);
    const [progressMap, setProgressMap] = React.useState<Record<string, number>>({});
    const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

    const inputRef = React.useRef<HTMLInputElement>(null);
    const onChangeRef = React.useRef(onChange);

    // Keep onChange ref up to date
    React.useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    // Only call onChange when items actually change, not on every render
    React.useEffect(() => {
        if (onChangeRef.current) {
            onChangeRef.current(items);
        }
    }, [items]);

    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const arr = Array.from(files);

        const allowed = Math.max(1, maxFiles);
        if (items.length + arr.length > allowed) {
            toast.error("Too many files", { description: `Max ${allowed} files allowed.` });
            return;
        }

        setUploading(true);

        for (const file of arr) {
            // Client-side validations
            if (file.size > maxSizeMB * 1024 * 1024) {
                toast.error("File too large", { description: `${file.name} exceeds ${maxSizeMB}MB` });
                continue;
            }
            if (accept.length && !accept.some((a) => matchAccept(a, file.type, file.name))) {
                toast.error("Invalid type", { description: `${file.name} is not an accepted file type` });
                continue;
            }

            try {
                // 1) Get presigned POST
                const signRes = await axios.post("/api/uploads/sign", {
                    filename: file.name,
                    contentType: file.type || "application/octet-stream",
                    folder,
                    maxSizeMB,
                });
                if (!signRes.data?.success) throw new Error(signRes.data?.error || "Sign failed");
                const { url, fields, key, publicUrl } = signRes.data.data as { 
                    url: string; 
                    fields: Record<string, string>; 
                    key: string; 
                    publicUrl: string 
                };

                // 2) Upload directly to S3 via FormData
                const form = new FormData();
                Object.entries(fields).forEach(([k, v]) => form.append(k, v));
                form.append("file", file);

                await axios.post(url, form, {
                    onUploadProgress: (e) => {
                        const pct = e.total ? Math.round((e.loaded / e.total) * 100) : 0;
                        setProgressMap((m) => ({ ...m, [key]: pct }));
                    },
                });

                setItems((prev) => {
                    const next = [...prev];
                    const item: UploadItem = { 
                        key, 
                        url: publicUrl, 
                        name: file.name, 
                        size: file.size, 
                        type: file.type 
                    };
                    next.push(item);
                    return next;
                });
                toast.success("Uploaded", { description: file.name });
            } catch (err: any) {
                console.error("upload error", err);
                toast.error("Upload failed", { description: err?.message || "Unknown error" });
            }
        }

        setUploading(false);
    };

    const removeItem = async (item: UploadItem) => {
        try {
            await axios.delete(`/api/uploads/delete?key=${encodeURIComponent(item.key)}`);
            setItems((prev) => prev.filter((x) => x.key !== item.key));
            toast.success("Deleted successfully", { description: item.name });
        } catch (err: any) {
            console.error("delete error", err);
            toast.error("Delete failed", { description: err?.message || "Unknown error" });
        }
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        const newItems = [...items];
        const [draggedItem] = newItems.splice(draggedIndex, 1);
        newItems.splice(dropIndex, 0, draggedItem);
        setItems(newItems);
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    return (
        <div className={cn("space-y-3", className)}>
            {label && <div className="text-sm font-medium">{label}</div>}
            <Card className={cn("border-dashed", disabled && "opacity-60 pointer-events-none")}>
                <CardContent className="p-4">
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            handleFiles(e.dataTransfer.files);
                        }}
                        className={cn(
                            "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center",
                            "bg-muted/30 hover:bg-muted/50 transition-colors"
                        )}
                    >
                        <Upload className="h-8 w-8" />
                        <div className="text-sm">Drag & drop images here, or</div>
                        <div>
                            <Button 
                                type="button" 
                                variant="secondary" 
                                size="sm" 
                                onClick={() => inputRef.current?.click()}
                                disabled={disabled || uploading}
                            >
                                Browse
                            </Button>
                        </div>
                        <Input
                            ref={inputRef}
                            type="file"
                            className="hidden"
                            multiple
                            accept={accept.join(",")}
                            onChange={(e) => handleFiles(e.currentTarget.files)}
                            disabled={disabled || uploading}
                        />
                        {helperText && <p className="text-xs text-muted-foreground mt-2">{helperText}</p>}
                        <p className="text-xs text-muted-foreground">
                            Max size {maxSizeMB}MB • up to {maxFiles} images
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Sortable grid of items */}
            {!!items.length && (
                <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                        Drag images to reorder. First image will be the primary image.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {items.map((it, index) => (
                            <div
                                key={it.key}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, index)}
                                onDragEnd={handleDragEnd}
                                className={cn(
                                    "relative rounded-xl border bg-card p-3 overflow-hidden cursor-move transition-all",
                                    draggedIndex === index && "opacity-50 scale-95",
                                    dragOverIndex === index && "border-primary ring-2 ring-primary"
                                )}
                            >
                                <button
                                    type="button"
                                    onClick={() => removeItem(it)}
                                    className="absolute right-2 top-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full border bg-background/90 backdrop-blur hover:bg-destructive hover:text-destructive-foreground transition-colors"
                                    aria-label={`Delete ${it.name}`}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>

                                <div className="absolute left-2 top-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full border bg-background/90 backdrop-blur">
                                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                                </div>

                                {index === 0 && (
                                    <div className="absolute left-2 bottom-2 z-10 px-2 py-0.5 rounded text-xs font-medium bg-primary text-primary-foreground">
                                        Primary
                                    </div>
                                )}

                                <div className="aspect-square rounded-md border bg-muted overflow-hidden mb-2">
                                    {it.type.startsWith("image/") ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img 
                                            src={it.url} 
                                            alt={it.name} 
                                            className="h-full w-full object-cover" 
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center">
                                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <div className="truncate text-xs font-medium" title={it.name}>
                                        {it.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {prettyBytes(it.size)}
                                    </div>
                                </div>

                                {typeof progressMap[it.key] === "number" && progressMap[it.key] < 100 && (
                                    <div className="mt-2">
                                        <Progress value={progressMap[it.key]} className="h-1" />
                                        <div className="mt-1 text-xs text-muted-foreground text-center">
                                            {progressMap[it.key]}%
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function matchAccept(acceptRule: string, fileType: string, fileName: string) {
    if (acceptRule.endsWith("/*")) {
        const base = acceptRule.slice(0, -2);
        return fileType.startsWith(base + "/");
    }
    if (acceptRule.startsWith(".")) {
        return fileName.toLowerCase().endsWith(acceptRule.toLowerCase());
    }
    return fileType === acceptRule;
}

