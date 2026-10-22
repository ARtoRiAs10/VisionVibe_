import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-lg bg-gradient-to-r from-muted via-muted/60 to-muted",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
