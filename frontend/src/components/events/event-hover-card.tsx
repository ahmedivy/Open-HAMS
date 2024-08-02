import { reAssignAnimalsToEvent } from "@/api/event";
import { arraysEqual } from "@/utils";
import { EventWithDetailsAndComments } from "@/utils/types";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { AnimalsSelect } from "./animals-select";
import { AnimalCheckInOut } from "./check-in-out";
import { CommentsBox } from "./comments-box";

export function EventHoverCard({
  data,
  title,
}: {
  data: EventWithDetailsAndComments;
  title?: string;
  compact?: boolean;
}) {
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>(
    data.animals.map(({ animal }) => animal.id.toString()),
  );

  const [animalView, setAnimalView] = useState<
    "assign" | "check_in" | "check_out"
  >("assign");
  const [isLoading, setIsLoading] = useState(false);

  const animals = data.animals.map(({ animal }) => animal.id.toString());

  async function reAssignAnimals() {
    const animalIds = selectedAnimals.map((id) => parseInt(id));

    setIsLoading(true);
    const res = await reAssignAnimalsToEvent(
      data.event.id.toString(),
      animalIds.map((id) => id.toString()),
    );

    if (res.status === 200) {
      toast.success(res.data.message);
    } else {
      toast.error(res.data.detail);
    }
    setIsLoading(false);
  }

  const isEventStarted = new Date(data.event.start_at) < new Date();

  return (
    <Card className="w-96 rounded-md border-b bg-model px-3 py-2 shadow-lg">
      <div className="grid gap-2">
        <div className="flex w-full justify-between gap-2">
          {animalView === "assign" && (
            <>
              <AnimalsSelect
                selectedAnimals={selectedAnimals}
                setSelectedAnimals={setSelectedAnimals}
                animalsDetails={data.animals}
                title={title || "Animals"}
              />
              {
                // if selected animals changed show save button
                !arraysEqual(selectedAnimals, animals) ? (
                  <Button
                    size="xs"
                    className="ml-auto max-w-fit py-0 font-light"
                    onClick={reAssignAnimals}
                    disabled={isLoading}
                  >
                    Save
                  </Button>
                ) : (
                  <Button
                    size="xs"
                    className="leading-0 ml-auto max-w-fit justify-between py-0"
                    onClick={() =>
                      setAnimalView(isEventStarted ? "check_in" : "check_out")
                    }
                  >
                    {isEventStarted ? "Check In" : "Check Out"}
                    <ChevronRight className="ml-2 size-4" />
                  </Button>
                )
              }
            </>
          )}
          {animalView === "check_in" && (
            <>
              <AnimalCheckInOut
                eventId={data.event.id.toString()}
                mode="check_in"
                animalsDetails={data.animals}
                setView={setAnimalView}
              />
            </>
          )}
          {animalView === "check_out" && (
            <>
              <AnimalCheckInOut
                eventId={data.event.id.toString()}
                mode="check_out"
                animalsDetails={data.animals}
                setView={setAnimalView}
              />
            </>
          )}
        </div>
        <CommentsBox
          eventId={data.event.id.toString()}
          comments={data.comments}
          className="h-[120px] overflow-auto px-0"
          compact
        />
      </div>
    </Card>
  );
}
