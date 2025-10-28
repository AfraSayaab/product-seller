// ===============================
// components/uploader/ImageFileUploader.tsx
// ===============================
"use client";
import * as React from "react";
import axios from "axios";
import { cn } from "@/lib/utils"; // or your own cn helper
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { Upload, X, Trash2, FileIcon, Image as ImageIcon } from "lucide-react";
import type { UploadItem, UploaderProps } from "@/components/admin/types/uploader";

// Small helper to format sizes
function prettyBytes(bytes: number) {
    const units = ["B", "KB", "MB", "GB"]; let i = 0; let n = bytes;
    while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
    return `${n.toFixed(1)} ${units[i]}`;
}

export default function ImageFileUploader({
    mode = "single",
    accept = ["image/*"],
    maxFiles = 10,
    maxSizeMB = 10,
    folder = "uploads",
    disabled = false,
    defaultValue = null,
    label = "Upload files",
    helperText,
    className,
    onChange,
}: UploaderProps) {
    const [items, setItems] = React.useState<UploadItem[]>(() => {
        if (!defaultValue) return [];
        return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
    });
    const [uploading, setUploading] = React.useState(false);
    const [progressMap, setProgressMap] = React.useState<Record<string, number>>({});

    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (!onChange) return;
        if (mode === "single") {
            onChange(items[0] ?? null);
        } else {
            onChange(items);
        }
    }, [items, mode, onChange]);

    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const arr = Array.from(files);

        if (mode === "single" && arr.length > 1) {
            toast.error("Only one file allowed", { description: "Switch to multiple mode to upload more" });
            return;
        }

        if (mode === "multiple") {
            const allowed = Math.max(1, maxFiles);
            if (items.length + arr.length > allowed) {
                toast.error("Too many files", { description: `Max ${allowed} files allowed.` });
                return;
            }
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
                const { url, fields, key, publicUrl } = signRes.data.data as { url: string; fields: Record<string, string>; key: string; publicUrl: string };

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
                    const item: UploadItem = { key, url: publicUrl, name: file.name, size: file.size, type: file.type };
                    if (mode === "single") return [item];
                    next.push(item);
                    return next;
                });
                toast("Uploaded", { description: file.name });
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
            toast("Deleted successfully", { description: item.name });
        } catch (err: any) {
            console.error("delete error", err);
            toast.error("Delete failed", { description: err?.message || "Unknown error" });
        }
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
                        <div className="text-sm">Drag & drop files here, or</div>
                        <div>
                            <Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
                                Browse
                            </Button>
                        </div>
                        <Input
                            ref={inputRef}
                            type="file"
                            className="hidden"
                            multiple={mode === "multiple"}
                            accept={accept.join(",")}
                            onChange={(e) => handleFiles(e.currentTarget.files)}
                            disabled={disabled || uploading}
                        />
                        {helperText && <p className="text-xs text-muted-foreground mt-2">{helperText}</p>}
                        <p className="text-xs text-muted-foreground">Max size {maxSizeMB}MB {mode === "multiple" && `• up to ${maxFiles} files`}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Grid of items */}
            {!!items.length && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {items.map((it) => (
                        <div key={it.key} className="relative rounded-xl border bg-card p-3 overflow-hidden">
                            <button
                                type="button"
                                onClick={() => removeItem(it)}
                                className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border bg-background/80 backdrop-blur hover:bg-background"
                                aria-label={`Delete ${it.name}`}
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="h-14 w-14 rounded-md border bg-muted flex items-center justify-center overflow-hidden">
                                    {it.type.startsWith("image/") ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={it.url} alt={it.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <FileIcon className="h-6 w-6" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-sm font-medium" title={it.name}>{it.name}</div>
                                    <div className="text-xs text-muted-foreground">{prettyBytes(it.size)} • {it.type || "unknown"}</div>
                                </div>
                            </div>

                            {typeof progressMap[it.key] === "number" && progressMap[it.key] < 100 && (
                                <div className="mt-3">
                                    <Progress value={progressMap[it.key]} />
                                    <div className="mt-1 text-xs text-muted-foreground">{progressMap[it.key]}%</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function matchAccept(acceptRule: string, fileType: string, fileName: string) {
    // Supports "image/*", exact mime, or ".ext"
    if (acceptRule.endsWith("/*")) {
        const base = acceptRule.slice(0, -2);
        return fileType.startsWith(base + "/");
    }
    if (acceptRule.startsWith(".")) {
        return fileName.toLowerCase().endsWith(acceptRule.toLowerCase());
    }
    return fileType === acceptRule;
}

// // ===============================
// // Example usage in a form (parent controls)
// // ===============================
// // app/(protected)/products/new/page.tsx
// "use client";
// import * as React from "react";
// import ImageFileUploader from "@/components/uploader/ImageFileUploader";
// import type { UploadItem } from "@/components/uploader/types";
// import { Button } from "@/components/ui/button";
// import { useToast } from "@/components/ui/use-toast";

// export default function NewProductPage() {
//   const { toast } = useToast();
//   const [hero, setHero] = React.useState<UploadItem | null>(null); // single
//   const [gallery, setGallery] = React.useState<UploadItem[]>([]);   // multiple

//   const submit = async () => {
//     // Example: send keys/urls with your form payload
//     const payload = {
//       title: "Sample",
//       hero: hero,           // single item (or null)
//       gallery: gallery,     // array
//     };
//     console.log(payload);
//     toast({ title: "Saved (demo)", description: "Check console for payload" });
//   };

//   return (
//     <div className="max-w-3xl mx-auto space-y-8 p-6">
//       <div className="space-y-2">
//         <h1 className="text-2xl font-semibold">New Product</h1>
//         <p className="text-sm text-muted-foreground">Demo page showing single + multiple uploaders.</p>
//       </div>

//       <div className="space-y-4">
//         <ImageFileUploader
//           label="Hero Image"
//           helperText="JPEG/PNG/WebP up to 5MB"
//           mode="single"
//           accept={["image/*"]}
//           maxSizeMB={5}
//           folder="products/hero"
//           defaultValue={null}
//           onChange={(v) => setHero(v as UploadItem | null)}
//         />

//         <ImageFileUploader
//           label="Gallery"
//           helperText="Up to 6 images"
//           mode="multiple"
//           accept={["image/*"]}
//           maxFiles={6}
//           maxSizeMB={5}
//           folder="products/gallery"
//           defaultValue={[]}
//           onChange={(v) => setGallery(v as UploadItem[])}
//         />
//       </div>

//       <Button onClick={submit}>Submit</Button>
//     </div>
//   );
// }

// // ===============================
// // Notes
// // ===============================
// // • Component returns a single UploadItem when mode="single", otherwise UploadItem[].
// // • Delete calls your /api/upload?key=... to remove from S3 and local state.
// // • PUBLIC_CDN_URL lets you serve via CloudFront; otherwise it returns S3 URL.
// // • Tighten server-side conditions as needed (e.g., exact content types).
// // • For private buckets, you can store keys only and serve via signed GETs elsewhere.
