"use client";

import { useTransition } from "react";
import { deleteArticle } from "./actions";

export function DeleteArticleButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this article?")) {
      return;
    }

    const formData = new FormData();
    formData.set("id", id);
    startTransition(() => {
      deleteArticle(formData);
    });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-sm border border-border px-4 h-10 text-sm font-semibold text-muted-foreground hover:border-red-500/40 hover:text-red-400 transition-colors disabled:opacity-60"
    >
      {isPending ? "Deleting..." : "Delete Article"}
    </button>
  );
}
