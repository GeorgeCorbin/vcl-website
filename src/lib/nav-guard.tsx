"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/ui/confirm-modal";

type NavGuardCtx = {
  /** Register / clear dirty state from any page component. */
  setDirty: (v: boolean) => void;
  /**
   * Navigate to `href`, but first show a "Leave without saving?" modal if
   * dirty state is active. Pass `onClose` to also close a mobile sheet, etc.
   */
  guardNavigate: (href: string, onClose?: () => void) => void;
};

const NavGuardContext = createContext<NavGuardCtx>({
  setDirty: () => {},
  guardNavigate: () => {},
});

export function NavGuardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Use refs so guard logic never stale-closes over old state
  const isDirtyRef = useRef(false);
  const pendingHrefRef = useRef<string | null>(null);
  const pendingCloseRef = useRef<(() => void) | undefined>(undefined);

  const [showModal, setShowModal] = useState(false);

  const setDirty = useCallback((v: boolean) => {
    isDirtyRef.current = v;
  }, []);

  const guardNavigate = useCallback(
    (href: string, onClose?: () => void) => {
      if (isDirtyRef.current) {
        pendingHrefRef.current = href;
        pendingCloseRef.current = onClose;
        setShowModal(true);
      } else {
        onClose?.();
        router.push(href);
      }
    },
    [router]
  );

  const handleConfirm = useCallback(() => {
    isDirtyRef.current = false;
    setShowModal(false);
    pendingCloseRef.current?.();
    pendingCloseRef.current = undefined;
    if (pendingHrefRef.current) {
      router.push(pendingHrefRef.current);
      pendingHrefRef.current = null;
    }
  }, [router]);

  const handleCancel = useCallback(() => {
    setShowModal(false);
    pendingHrefRef.current = null;
    pendingCloseRef.current = undefined;
  }, []);

  return (
    <NavGuardContext.Provider value={{ setDirty, guardNavigate }}>
      {children}
      <ConfirmModal
        open={showModal}
        onOpenChange={(open) => { if (!open) handleCancel(); }}
        title="Leave without saving?"
        description="You have unsaved changes. Leaving now will discard them."
        confirmLabel="Leave"
        cancelLabel="Keep editing"
        variant="destructive"
        onConfirm={handleConfirm}
      />
    </NavGuardContext.Provider>
  );
}

export function useNavGuard() {
  return useContext(NavGuardContext);
}
