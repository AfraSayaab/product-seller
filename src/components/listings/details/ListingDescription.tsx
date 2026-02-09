"use client";

function sanitizeHtml(input: string) {
  if (!input) return "";

  let html = input;

  // Remove script/style/iframe/object/embed/meta/link tags
  html = html.replace(
    /<\/?(script|style|iframe|object|embed|meta|link)([\s\S]*?)>/gi,
    ""
  );

  // Remove inline event handlers like onclick="..."
  html = html.replace(/\son\w+\s*=\s*(['"]).*?\1/gi, "");

  // Remove javascript: and data: (common XSS vectors) from href/src
  html = html.replace(
    /\s(href|src)\s*=\s*(['"])\s*(javascript:|data:)[\s\S]*?\2/gi,
    ""
  );

  // Optional: strip <img> entirely (if you don't want images in description)
  // html = html.replace(/<\/?img[^>]*>/gi, "");

  return html;
}

export default function ListingDescription({ description }: { description: string }) {
  const safe = sanitizeHtml(description);

  return (
    <div className="border-t pt-6">
      <h3 className="mb-2 font-semibold">Description</h3>

      <div
        className="prose prose-sm max-w-none text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: safe }}
      />
    </div>
  );
}
