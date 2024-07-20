import { useAnimalStatus } from "@/api/queries";
import { LoadingDots } from "../icons";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { AvatarWithTooltip } from "./avatar-with-tooltip";
import { CustomSelect } from "./custom-select";

export function AnimalsSelect(props: {
  selectedAnimals: string[];
  setSelectedAnimals: (value: string[]) => void;
}) {
  const animals = useAnimalStatus();
  if (animals.isLoading) return <LoadingDots />;

  return (
    <CustomSelect
      label="Animals"
      placeholder="Search animals"
      options={animals.data!.map((animal_info) => ({
        value: animal_info.animal.id.toString(),
        label: animal_info.animal.name,
        toRender: (
          <>
            <Avatar className="size-5">
              <AvatarImage src="/placeholder-avatar.png" />
            </Avatar>
            <span className="font-extralightlight text-xs text-foreground">
              {animal_info.animal.name}
            </span>
            <span className="ml-auto">
              {animal_info.status === "available" ? (
                <div className="flex items-center gap-2">
                  <span className="text-green-400">Available</span>
                </div>
              ) : animal_info.status === "unavailable" ? (
                <div className="flex items-center">
                  <span>Unavailable</span>
                  <span className="w-[30px] text-wrap text-start text-[8px] leading-tight">
                    {animal_info.status_description}
                  </span>
                </div>
              ) : (
                <span className="">Checked Out</span>
              )}
            </span>
          </>
        ),
      }))}
      selected={props.selectedAnimals}
      setSelected={props.setSelectedAnimals}
      listElement={({ value }: { value: string }) => {
        const animal = animals.data!.find(
          (animal_info) => animal_info.animal.id.toString() === value,
        );
        return (
          <AvatarWithTooltip src="/placeholder-avatar.png">
            <div className="flex items-center gap-2">
              <Avatar className="size-8">
                <AvatarImage src="/placeholder-avatar.png" />
              </Avatar>
              <span className="text-md font-semibold">
                {animal?.animal.name}
              </span>
              <Button
                className="ml-auto"
                size={"xs"}
                onClick={(e) => {
                  e.preventDefault();

                  props.setSelectedAnimals(
                    props.selectedAnimals.filter((id) => id !== value),
                  );
                }}
              >
                Remove
              </Button>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <Label className="text-xs font-semibold">Status:</Label>
              <span className="text-xs">{animal?.status_description}</span>
            </div>
          </AvatarWithTooltip>
        );
      }}
    />
  );
}
