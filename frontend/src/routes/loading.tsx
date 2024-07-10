import { Spinner } from "@/components/icons";

export function Loading() {
  return (
    <div className="flex h-[600px] w-full flex-col items-center justify-center">
      <Spinner className="size-8" />
    </div>
  );
}
