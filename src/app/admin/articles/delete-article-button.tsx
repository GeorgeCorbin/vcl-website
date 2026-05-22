"use client";

import { deleteArticle } from "./actions";

export function DeleteArticleButton({ id }: { id: string }) {
  return (
    <form action={deleteArticle} className="flex-shrink-0">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
        onClick={(e) => {
          if (!confirm("Are you sure you want to delete this article?")) {
            e.preventDefault();
          }
        }}
      >
        Delete Article
      </button>
    </form>
  );
}
