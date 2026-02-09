"use client";
//src\components\admin\blog\postform.tsx
import * as React from "react";
import { Editor } from "@tinymce/tinymce-react";
import Image from "next/image";

export interface BlogFormData {
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  schemaMarkup: string;
  content: string;
  image: File | string | null;   // 🔥 FIX
  imageAlt: string;
  isPublished: boolean;
}

interface PostFormProps {
  formData: BlogFormData;
  setFormData: React.Dispatch<React.SetStateAction<BlogFormData>>;
  autoSlug: boolean;
  setAutoSlug: React.Dispatch<React.SetStateAction<boolean>>;
  imagePreview: string | null;
  setImagePreview: React.Dispatch<React.SetStateAction<string | null>>;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function PostForm({
  formData,
  setFormData,
  autoSlug,
  setAutoSlug,
  imagePreview,
  setImagePreview,
  isSubmitting,
  onCancel,
  onSubmit,
}: PostFormProps) {
  /* ---------------- Image Upload (Preview Only) ---------------- */
 const handleImageChange = (file: File | null) => {
  if (!file) return;

  setImagePreview(URL.createObjectURL(file)); // preview only
  setFormData((prev) => ({
    ...prev,
    image: file, // ✅ store FILE, not URL
  }));
};


  return (
    <form onSubmit={onSubmit} className="space-y-8 p-6">
      {/* Title */}
      <div className="space-y-2">
        <label className="text-sm font-bold">
          Title <span className="text-red-600">*</span>
        </label>
        <input
          value={formData.title}
          onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
          required
          disabled={isSubmitting}
          className="w-full rounded-lg border px-4 py-3"
          placeholder="Enter blog title"
        />
      </div>

      {/* Slug */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-bold">
            Slug <span className="text-red-600">*</span>
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={autoSlug}
              onChange={(e) => setAutoSlug(e.target.checked)}
            />
            Auto-generate
          </label>
        </div>
        <input
          value={formData.slug}
          onChange={(e) => {
            setAutoSlug(false);
            setFormData((p) => ({ ...p, slug: e.target.value }));
          }}
          required
          disabled={autoSlug || isSubmitting}
          className="w-full rounded-lg border px-4 py-3 disabled:bg-gray-100"
        />
      </div>

      {/* SEO Metadata */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="font-bold">SEO Metadata</h3>
        <input
          placeholder="Meta Title"
          value={formData.metaTitle}
          onChange={(e) => setFormData((p) => ({ ...p, metaTitle: e.target.value }))}
          className="w-full rounded-lg border px-4 py-3"
        />
        <textarea
          placeholder="Meta Description"
          value={formData.metaDescription}
          onChange={(e) => setFormData((p) => ({ ...p, metaDescription: e.target.value }))}
          className="w-full rounded-lg border px-4 py-3 h-24"
        />
        <input
          placeholder="software development, IT services"
          value={formData.keywords}
          onChange={(e) => setFormData((p) => ({ ...p, keywords: e.target.value }))}
          className="w-full rounded-lg border px-4 py-3"
        />
      </div>

      {/* Schema */}
      <div className="space-y-2">
        <label className="text-sm font-bold">Schema Markup (JSON-LD)</label>
        <textarea
          value={formData.schemaMarkup}
          onChange={(e) => setFormData((p) => ({ ...p, schemaMarkup: e.target.value }))}
          className="w-full rounded-lg border px-4 py-3 h-40 font-mono text-sm"
        />
      </div>

      {/* Post Content */}
      <div className="space-y-2">
        <label className="text-sm font-bold">Post Content</label>
        <Editor
  apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
  value={formData.content}
  onEditorChange={(value) => setFormData((p) => ({ ...p, content: value }))}
  init={{
    height: 600,
    menubar: true,
    plugins: [
      "advlist autolink autosave charmap code codesample directionality emoticons fullscreen help image importcss link lists liststyle media nonbreaking pagebreak preview quickbars save searchreplace table visualblocks visualchars wordcount toc anchor template"
    ],
    toolbar: [
      "undo redo | styleselect | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist | outdent indent | blockquote | link image media | table | codesample code | charmap emoticons | fullscreen preview | save searchreplace | anchor toc | template"
    ],
    toolbar_mode: "floating",
    contextmenu: "link image imagetools table",
    quickbars_selection_toolbar: "bold italic | quicklink h2 h3 blockquote",
    quickbars_insert_toolbar: "quicktable image media codesample",
    autosave_interval: "30s",
    image_advtab: true,
    importcss_append: true,
    content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",

    /* ---------------- Two-column template ---------------- */
    templates: [
      {
        title: "Two Columns",
        description: "Insert a two-column layout",
        content: `
          <div style="display: flex; gap: 20px;">
            <div style="flex: 1; padding: 10px; border: 1px solid #ddd;">Left Column Content</div>
            <div style="flex: 1; padding: 10px; border: 1px solid #ddd;">Right Column Content</div>
          </div>
        `
      }
    ]
  }}
/>

      </div>

      {/* Featured Image */}
      <div className="space-y-3">
        <label className="text-sm font-bold">Featured Image</label>

        <label className="block w-50 border border-gray-300 rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-50">
          <span className="text-sm text-gray-600">
            {imagePreview ? "Change Image" : "Choose File"}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && handleImageChange(e.target.files[0])}
          />
        </label>

        {imagePreview && (
          <Image
            src={imagePreview}
            alt={formData.imageAlt || "Blog image preview"}
            width={200}
            height={150}
            className="rounded-lg object-cover"
          />
        )}

        <input
          placeholder="Alt text"
          value={formData.imageAlt}
          onChange={(e) => setFormData((p) => ({ ...p, imageAlt: e.target.value }))}
          className="w-full rounded-lg border px-4 py-3"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-2 rounded-lg border font-bold"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 rounded-lg bg-black text-white font-bold"
        >
          {isSubmitting ? "Saving..." : "Save Blog"}
        </button>
      </div>
    </form>
  );
}
