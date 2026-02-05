"use client";

export default function CreateBlogPage() {
  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Create Blog</h1>

      <form className="space-y-4">
        <input
          type="text"
          placeholder="Blog Title"
          className="w-full border p-2"
        />

        <textarea
          placeholder="Blog Content"
          className="w-full border p-2 h-40"
        />

        <button className="bg-black text-white px-4 py-2 rounded">
          Publish
        </button>
      </form>
    </div>
  );
}
