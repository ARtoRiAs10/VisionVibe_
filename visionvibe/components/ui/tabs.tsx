"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const TabsContext = React.createContext<{
  value: string;
  setValue: (value: string) => void;
} | null>(null);

function Tabs({
  value,
  onValueChange,
  defaultValue,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "onValueChange"> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}) {
  const [internal, setInternal] = React.useState(defaultValue ?? "");
  const current = value ?? internal;

  const setValue = React.useCallback(
    (next: string) => {
      if (value === undefined) setInternal(next);
      onValueChange?.(next);
    },
    [value, onValueChange]
  );

  return (
    <TabsContext.Provider value={{ value: current, setValue }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function TabsList({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "inline-flex h-9 items-center justify-center gap-1 rounded-xl border border-border bg-muted/60 p-1",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({ className, value, ...props }: React.ComponentProps<"button"> & { value: string }) {
  const ctx = React.useContext(TabsContext);
  const active = ctx?.value === value;
  return (
    <button
      type="button"
      onClick={() => ctx?.setValue(value)}
      className={cn(
        "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
        active
          ? "bg-card text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  value,
  ...props
}: React.ComponentProps<"div"> & { value: string }) {
  const ctx = React.useContext(TabsContext);
  if (ctx?.value !== value) return null;
  return <div className={cn("animate-fade-up", className)} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
