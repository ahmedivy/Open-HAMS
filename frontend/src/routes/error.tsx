import { TriangleAlert } from "lucide-react";

export function Error() {
  return (
    <div className="flex h-[600px] flex-1 w-full flex-col items-center justify-center gap-6">
      <TriangleAlert className="size-10" />
      <p className="text-lg font-light">
        Something went wrong. Try refreshing the page.
      </p>
    </div>
  );
}
