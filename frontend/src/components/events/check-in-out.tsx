import { checkinAnimals, checkoutAnimals } from "@/api/event";
import { useAnimalStatus, useUser } from "@/api/queries";
import { formatDate, formatTime, hasPermission } from "@/utils";
import { AnimalEventWithDetails } from "@/utils/types";
import { CheckedState } from "@radix-ui/react-checkbox";
import { CheckCircle, Minus, XCircle } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "react-query";
import { toast } from "sonner";
import { LoadingDots } from "../icons";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { AvatarWithTooltip } from "./avatar-with-tooltip";

export function AnimalCheckInOut(props: {
  eventId: string;
  mode: "check_in" | "check_out";
  animalsDetails: AnimalEventWithDetails[];
  setView?: (view: "assign" | "check_in" | "check_out") => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const user = useUser();
  const queryclient = useQueryClient();
  const { data: animalsStatus, isLoading } = useAnimalStatus();
  if (isLoading || user.isLoading) return <LoadingDots className="size-4" />;

  async function handleSubmit() {
    setLoading(true);

    var res;
    if (props.mode === "check_in") {
      res = await checkinAnimals(props.eventId, selected);
    } else {
      res = await checkoutAnimals(props.eventId, selected);
    }

    if (res.status === 200) {
      toast.success(res.data.message);
      queryclient.resetQueries();
    } else {
      toast.error(res.data.detail);
    }
    setLoading(false);
  }

  return (
    <div className="flex w-full flex-col justify-between gap-3">
      <div className="grid">
        <Label className="text-sm font-light">Animals</Label>
        <div className="flex h-12 flex-wrap items-center gap-2">
          <Minus
            className="size-5 cursor-pointer text-red-500"
            onClick={() => props.setView?.("assign")}
          />
          {props.animalsDetails.map((animalDetails) => {
            const animalStatus = animalsStatus?.find(
              (status) => status.animal.id === animalDetails.animal.id,
            );

            return (
              <AvatarWithTooltip
                key={animalDetails.animal.id}
                src={animalDetails.animal.image!}
                className="cursor-pointer"
                isSelected={selected.includes(
                  animalDetails.animal.id.toString(),
                )}
                onClick={() =>
                  setSelected(
                    selected.includes(animalDetails.animal.id.toString())
                      ? selected.filter(
                          (id) => id !== animalDetails.animal.id.toString(),
                        )
                      : [...selected, animalDetails.animal.id.toString()],
                  )
                }
              >
                <div className="flex items-center gap-2">
                  <Avatar className="size-8">
                    <AvatarImage src={animalDetails.animal.image!} />
                  </Avatar>
                  <span className="text-md font-semibold">
                    {animalDetails?.animal.name}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs font-light">
                    Checkout for Event:
                  </Label>
                  {animalDetails.animal_event.checked_out ? (
                    <p>
                      {formatDate(animalDetails.animal_event.checked_out)} -
                      {formatTime(animalDetails.animal_event.checked_out)}
                    </p>
                  ) : (
                    <p>N/A</p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs font-light">
                    Checkin for Event:
                  </Label>
                  {animalDetails.animal_event.checked_in ? (
                    <p>
                      {`${formatDate(animalDetails.animal_event.checked_in)}`}-
                      {formatTime(animalDetails.animal_event.checked_in)}
                    </p>
                  ) : (
                    <p>N/A</p>
                  )}
                </div>

                <div className="my-2">
                  {animalStatus?.status === "available" ? (
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="size-4 text-green-500" />
                        <span className="text-sm">Available</span>
                      </div>
                      <p>{animalStatus?.status_description}</p>
                    </div>
                  ) : animalStatus?.status === "unavailable" ? (
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2">
                        <XCircle className="size-4 text-red-500" />
                        <span className="text-sm">Unavailable</span>
                      </div>
                      <p>{animalStatus?.status_description}</p>
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2">
                        <XCircle className="size-4" />
                        <span className="text-sm">Checked Out</span>
                      </div>
                      <p>{animalStatus?.status_description}</p>
                    </div>
                  )}
                </div>
              </AvatarWithTooltip>
            );
          })}
        </div>
      </div>
      <div className="ml-auto flex items-center gap-4 py-0">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="select-all"
            checked={selected.length === props.animalsDetails.length}
            onCheckedChange={(e: CheckedState) => {
              if (e === true) {
                setSelected(
                  props.animalsDetails.map(({ animal }) =>
                    animal.id.toString(),
                  ),
                );
              } else {
                setSelected([]);
              }
            }}
          />
          <label
            htmlFor="select-all"
            className="text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Select All
          </label>
        </div>
        {hasPermission(user.data!, "checkin_animals") &&
          (selected.length > 0 ? (
            <Button
              size="xs"
              className="max-w-fit py-0"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading
                ? "Loading..."
                : props.mode === "check_in"
                  ? "Check In"
                  : "Check Out"}
            </Button>
          ) : (
            <Button
              size="xs"
              className="ml-auto max-w-fit py-0"
              onClick={() => props.setView?.("assign")}
            >
              Cancel
            </Button>
          ))}
      </div>
    </div>
  );
}
