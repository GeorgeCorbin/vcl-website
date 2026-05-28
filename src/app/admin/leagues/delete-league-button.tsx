"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteLeagueConfig } from "./actions";
import { ConfirmModal } from "@/components/ui/confirm-modal";

type DeleteLeagueButtonProps = {
  id: string;
  leagueName: string;
};

export function DeleteLeagueButton({ id, leagueName }: DeleteLeagueButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);

  const handleConfirm = () => {
    const formData = new FormData();
    formData.set("id", id);
    startTransition(() => {
      deleteLeagueConfig(formData);
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:border-red-500/40 hover:text-red-400 transition-colors disabled:opacity-60"
      >
        <Trash2 className="h-3 w-3" />
        {isPending ? "Deleting..." : "Delete"}
      </button>

      <ConfirmModal
        open={showModal}
        onOpenChange={setShowModal}
        title="Delete league?"
        description={`This will permanently remove ${leagueName} and its related conferences and divisions. This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleConfirm}
      />
    </>
  );
}
