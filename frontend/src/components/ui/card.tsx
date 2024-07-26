import { cn } from "@/utils";

export function Card({
  className,
  children,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-md bg-white p-6 shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "font-extralight leading-relaxed text-muted-foreground",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function CardDetails({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p className={cn("text-xl font-bold leading-relaxed", className)}>
      {children}
    </p>
  );
}
