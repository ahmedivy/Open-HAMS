import { useHandlers } from "@/api/queries";
import { LoadingDots } from "../icons";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { AvatarWithTooltip } from "./avatar-with-tooltip";
import { CustomSelect } from "./custom-select";

export function HandlerSelect(props: {
  selectedHandlers: string[];
  setSelectedHandlers: (value: string[]) => void;
}) {
  const { data: handlers, isLoading } = useHandlers();
  if (isLoading) return <LoadingDots />;

  return (
    <CustomSelect
      label="Handlers"
      placeholder="Search handlers"
      options={handlers!.map((handler) => ({
        value: handler.id.toString(),
        label: `${handler.first_name} ${handler.last_name}`,
        toRender: (
          <>
            <Avatar className="size-5">
              <AvatarImage src="/placeholder-avatar.png" />
            </Avatar>
            <span className="text-xs font-light text-foreground">
              {handler.first_name} {handler.last_name}
            </span>
          </>
        ),
      }))}
      selected={props.selectedHandlers}
      setSelected={props.setSelectedHandlers}
      listElement={({ value }: { value: string }) => {
        const handler = handlers!.find(
          (handler) => handler.id.toString() === value,
        );
        return (
          <AvatarWithTooltip src="/placeholder-avatar.png">
            <div className="flex items-center gap-2">
              <Avatar className="size-8">
                <AvatarImage src="/placeholder-avatar.png" />
              </Avatar>
              <span className="text-md font-semibold">
                {handler?.first_name} {handler?.last_name}
              </span>
              <Button
                className="ml-auto"
                size={"xs"}
                onClick={(e) => {
                  e.preventDefault();

                  props.setSelectedHandlers(
                    props.selectedHandlers.filter((id) => id !== value),
                  );
                }}
              >
                Remove
              </Button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Label className="text-xs font-semibold">Email:</Label>
              <span className="text-xs">{handler?.email}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Label className="text-xs font-semibold">Zoo:</Label>
              <span className="text-xs">{handler?.zoo?.name}</span>
            </div>
          </AvatarWithTooltip>
        );
      }}
    />
  );
}
