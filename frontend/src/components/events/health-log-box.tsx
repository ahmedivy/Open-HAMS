import { createAnimalHealthLog } from "@/api/animals";
import { useUser } from "@/api/queries";
import { cn, formatDate, getInitials } from "@/utils";
import { HealthLog } from "@/utils/types";
import { Label } from "@radix-ui/react-label";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useState, useTransition } from "react";
import { useQueryClient } from "react-query";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function HealthLogBox({
  animalId,
  healthLogs,
  className,
  compact = false,
}: {
  animalId: string;
  healthLogs: HealthLog[];
  className?: string;
  compact?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [healthLog, setHealthLog] = useState("");
  const [isLoading, startTransition] = useTransition();
  const { data: user, isLoading: isUserLoading } = useUser();
  const queryClient = useQueryClient();

  const onClick = (e: any) => {
    e.preventDefault();

    if (isOpen && healthLog.length > 0) {
      startTransition(() => {
        createAnimalHealthLog(animalId, { details: healthLog }).then((res) => {
          if (res.status === 200) {
            toast.success("Health Log added successfully");
          } else {
            toast.error(res.data.detail);
          }
        });
        setIsOpen(false);
        setHealthLog("");
        if (animalId) {
          queryClient.invalidateQueries({
            queryKey: ["animal_details", animalId],
          });
        }
        queryClient.invalidateQueries({
          queryKey: ["restingAnimals"],
        });
      });
      return;
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <ScrollArea
      className={cn(
        "flex h-[200px] w-full flex-col rounded-lg bg-model px-2 py-2",
        className,
      )}
    >
      <form className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <Label className="font-light">Health Log</Label>
          <Button onClick={onClick} disabled={isLoading} size="xs">
            Add Health Log
          </Button>
        </div>
        {isOpen && (
          <div className="mb-2 mt-4 mr-2 flex items-center gap-3">
            {!compact && (
              <Avatar className="size-12 bg-secondary">
                <AvatarImage src={user?.image!} />
                <AvatarFallback className="mx-auto self-center text-xl">
                  {getInitials(user?.first_name!, user?.last_name)}
                </AvatarFallback>
              </Avatar>
            )}
            <Input
              placeholder="Add health log..."
              required
              className="h-12 w-full"
              value={healthLog}
              onChange={(e) => setHealthLog(e.target.value)}
            />
          </div>
        )}
      </form>

      <div className="flex flex-col gap-2">
        {healthLogs.map((healthLogDetails) => (
          <HealthLogEntry
            key={healthLogDetails.log.id}
            log={healthLogDetails}
            compact={compact}
          />
        ))}
        {healthLogs.length === 0 && (
          <div className="flex h-12 items-center justify-center text-sm font-light text-muted-foreground">
            No logs yet
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

export function HealthLogEntry({
  log,
  compact,
}: {
  log: HealthLog;
  compact?: boolean;
}) {
  return (
    <div className="flex items-center gap-4">
      {!compact && (
        <Avatar className="size-12">
          <AvatarImage src={log.user.image!} />
          <AvatarFallback className="mx-auto self-center text-xl">
            {getInitials(log.user.first_name!, log.user.last_name)}
          </AvatarFallback>
        </Avatar>
      )}
      <div className="grid gap-1">
        <div className="flex items-center gap-4 text-xs">
          <p>
            {log.user.first_name} {log.user.last_name}
          </p>
          <span className="font-extralight text-muted-foreground">
            {formatDate(log.log.logged_at)}
          </span>
        </div>
        <p className="text-sm font-light">{log.log.details}</p>
      </div>
    </div>
  );
}
