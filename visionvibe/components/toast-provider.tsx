"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastKind = "success" | "error" | "info" | "loading";

interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, kind?: ToastKind) => number;
  update: (id: number, message: string, kind?: ToastKind) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, kind: ToastKind = "info") => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, kind, message }]);
      if (kind !== "loading") {
        setTimeout(() => dismiss(id), 4200);
      }
      return id;
    },
    [dismiss]
  );

  const update = useCallback(
    (id: number, message: string, kind: ToastKind = "info") => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, message, kind } : t)));
      if (kind !== "loading") {
        setTimeout(() => dismiss(id), 4200);
      }
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast, update, dismiss }), [toast, update, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.96 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className={cn(
                "pointer-events-auto flex items-start gap-2.5 rounded-xl border bg-card/95 px-3.5 py-3 text-sm shadow-lg backdrop-blur",
                t.kind === "success" && "border-success/40",
                t.kind === "error" && "border-destructive/45"
              )}
            >
              <span className="mt-0.5 shrink-0">
                {t.kind === "success" && <CheckCircle2 className="h-4 w-4 text-success" />}
                {t.kind === "error" && <XCircle className="h-4 w-4 text-destructive" />}
                {t.kind === "info" && <Info className="h-4 w-4 text-primary" />}
                {t.kind === "loading" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
              </span>
              <span className="flex-1 leading-snug">{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Dismiss"
              >
                ×
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
