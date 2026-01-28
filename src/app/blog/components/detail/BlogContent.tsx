export default function BlogContent({ content }: { content: string }) {
    return (
      <article
        className="prose prose-lg max-w-none prose-p:text-gray-700 prose-h2:text-black prose-a:text-pink-500"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
  