"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteArticle } from "./actions";
import { ConfirmModal } from "@/components/ui/confirm-modal";

type DeleteArticleButtonProps = {
  id: string;
  className?: string;
  label?: string;
};

export function DeleteArticleButton({ id, className, label }: DeleteArticleButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);

  const handleConfirm = () => {
    const formData = new FormData();
    formData.set("id", id);
    startTransition(() => {
      deleteArticle(formData);
    });
  };

  const defaultClassName =
    "inline-flex flex-shrink-0 items-center gap-1.5 rounded-sm border border-border px-4 h-10 text-sm font-semibold text-muted-foreground hover:border-red-500/40 hover:text-red-400 transition-colors disabled:opacity-60";

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        disabled={isPending}
        className={className ?? defaultClassName}
      >
        <Trash2 className="h-3 w-3" />
        {isPending ? "Deleting..." : (label ?? "Delete Article")}
      </button>

      <ConfirmModal
        open={showModal}
        onOpenChange={setShowModal}
        title="Delete article?"
        description="This will permanently remove the article and cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleConfirm}
      />
    </>
  );
}
